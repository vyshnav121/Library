import BorrowRecord from '../models/BorrowRecord.js';
import Book from '../models/Book.js';
import FineRecord from '../models/FineRecord.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private
const borrowBook = async (req, res, next) => {
  try {
    const { bookId, days } = req.body;
    const borrowDays = days || 14;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user already borrowed this book and hasn't returned it
    const existingBorrow = await BorrowRecord.findOne({
      user: req.user._id,
      book: bookId,
      status: 'borrowed',
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Set due date based on days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(borrowDays));

    // Calculate total price
    const totalPrice = (book.pricePerDay || 0) * Number(borrowDays);

    const borrowRecord = await BorrowRecord.create({
      user: req.user._id,
      book: bookId,
      dueDate,
      borrowDays: Number(borrowDays),
      totalPrice,
      status: 'borrowed',
    });

    // Decrease available copies
    book.availableCopies -= 1;
    if (book.availableCopies === 0) {
      book.status = 'issued';
    }
    await book.save();

    // Send Real-Time Socket Notification
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', {
        title: 'Book Borrowed',
        message: `${req.user.name} has borrowed "${book.title}"`,
        type: 'info',
      });
    }

    // Save Notification to Database
    await Notification.create({
      user: req.user._id,
      title: 'Book Borrowed Successfully',
      message: `You checked out "${book.title}" for ${borrowDays} days. Due: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'success',
    });

    // Audit Log
    await ActivityLog.create({
      user: req.user._id,
      action: `Borrowed book: ${book.title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(borrowRecord);
  } catch (error) {
    next(error);
  }
};

// @desc    Return a book
// @route   POST /api/borrow/return
// @access  Private
const returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.body;

    const borrowRecord = await BorrowRecord.findById(borrowId).populate('book');

    if (!borrowRecord) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Calculate fine if overdue (e.g., $1.00 per day)
    const today = new Date();
    let fine = 0;
    let newStatus = 'returned';

    if (today > borrowRecord.dueDate) {
      const diffTime = Math.abs(today - borrowRecord.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 1.0; // $1.00 per day
      newStatus = 'overdue';
    }

    borrowRecord.status = 'returned'; // mark as returned
    borrowRecord.returnDate = today;
    borrowRecord.fine = fine;
    await borrowRecord.save();

    // Increase available copies
    const book = await Book.findById(borrowRecord.book._id);
    if (book) {
      book.availableCopies += 1;
      if (book.status === 'issued') {
        book.status = 'available';
      }
      await book.save();
    }

    // If there is an overdue fine, create a FineRecord
    if (fine > 0) {
      await FineRecord.create({
        user: borrowRecord.user,
        borrowRecord: borrowRecord._id,
        amount: fine,
        status: 'unpaid',
      });
    }

    // Send Real-Time Socket Notification to user
    const io = req.app.get('socketio');
    if (io) {
      io.to(borrowRecord.user.toString()).emit('notification', {
        title: 'Book Returned',
        message: `Your return for "${book?.title}" has been processed.${fine > 0 ? ` Overdue fine: $${fine.toFixed(2)}` : ''}`,
        type: fine > 0 ? 'warning' : 'success',
      });
    }

    // Save Notification to Database
    await Notification.create({
      user: borrowRecord.user,
      title: 'Book Returned',
      message: `Your return of "${book?.title}" was received.${fine > 0 ? ` Please pay the overdue fine of $${fine.toFixed(2)}` : ''}`,
      type: fine > 0 ? 'warning' : 'success',
    });

    // Audit Log
    await ActivityLog.create({
      user: req.user._id,
      action: `Returned book: ${book?.title || 'Unknown'}. Fine calculated: $${fine}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(borrowRecord);
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment for book borrow or fine (Stripe simulation)
// @route   POST /api/borrow/pay
// @access  Private
const paySimulated = async (req, res, next) => {
  try {
    const { referenceId, type, amount } = req.body;

    if (!referenceId || !type || !amount) {
      return res.status(400).json({ message: 'Missing payment parameters' });
    }

    // Generate simulated stripe txn ID
    const transactionId = `ch_sim_${Math.random().toString(36).substring(2, 15)}`;

    const payment = await Payment.create({
      user: req.user._id,
      amount: Number(amount),
      type,
      referenceId,
      transactionId,
      status: 'completed',
    });

    if (type === 'fine') {
      // Update FineRecord status
      const fineRecord = await FineRecord.findById(referenceId);
      if (fineRecord) {
        fineRecord.status = 'paid';
        fineRecord.paidAt = new Date();
        await fineRecord.save();
      }
    }

    // Audit Log
    await ActivityLog.create({
      user: req.user._id,
      action: `Completed simulated payment of $${amount} for ${type}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's borrow history
// @route   GET /api/borrow/my-history
// @access  Private
const getMyBorrowHistory = async (req, res, next) => {
  try {
    const records = await BorrowRecord.find({ user: req.user._id })
      .populate('book', 'title author coverImage isbn pricePerDay pdfUrl')
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's fine records
// @route   GET /api/borrow/my-fines
// @access  Private
const getMyFines = async (req, res, next) => {
  try {
    const fines = await FineRecord.find({ user: req.user._id })
      .populate({
        path: 'borrowRecord',
        populate: { path: 'book', select: 'title' }
      })
      .sort({ createdAt: -1 });
    res.json(fines);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all borrow records
// @route   GET /api/borrow
// @access  Private/Admin
const getAllBorrows = async (req, res, next) => {
  try {
    const records = await BorrowRecord.find({})
      .populate('book', 'title isbn')
      .populate('user', 'name email')
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fine records for admin
// @route   GET /api/borrow/fines
// @access  Private/Admin
const getAllFines = async (req, res, next) => {
  try {
    const fines = await FineRecord.find({})
      .populate('user', 'name email')
      .populate({
        path: 'borrowRecord',
        populate: { path: 'book', select: 'title' }
      })
      .sort({ createdAt: -1 });
    res.json(fines);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for analytics
// @route   GET /api/borrow/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeBorrows = await BorrowRecord.countDocuments({ status: 'borrowed' });
    
    // Fines stats
    const totalFines = await FineRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const fineAmount = totalFines[0]?.total || 0;

    // Monthly borrows for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBorrows = await BorrowRecord.aggregate([
      { $match: { borrowDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: '$borrowDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Map month number to names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyBorrows.map(item => ({
      name: monthNames[item._id - 1] || `Month ${item._id}`,
      Borrows: item.count
    }));

    // Category distribution
    const categoryDistribution = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          value: '$count'
        }
      }
    ]);

    // Audit logs (last 10)
    const recentLogs = await ActivityLog.find({})
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalBooks,
        totalUsers,
        activeBorrows,
        totalFines: fineAmount,
      },
      monthlyTrends: formattedMonthly.length > 0 ? formattedMonthly : [
        { name: 'Jan', Borrows: 4 },
        { name: 'Feb', Borrows: 10 },
        { name: 'Mar', Borrows: 15 },
        { name: 'Apr', Borrows: 12 },
        { name: 'May', Borrows: 22 },
        { name: 'Jun', Borrows: 30 }
      ],
      categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [
        { name: 'Technology', value: 12 },
        { name: 'Fiction', value: 8 },
        { name: 'Science', value: 5 },
        { name: 'History', value: 3 }
      ],
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};

export {
  borrowBook,
  returnBook,
  paySimulated,
  getMyBorrowHistory,
  getMyFines,
  getAllBorrows,
  getAllFines,
  getDashboardStats,
};

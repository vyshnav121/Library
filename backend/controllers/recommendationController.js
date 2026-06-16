import BorrowRecord from '../models/BorrowRecord.js';
import Book from '../models/Book.js';

// @desc    Get AI-powered book recommendations for the logged-in user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get current user's borrowing history
    const userHistory = await BorrowRecord.find({ user: userId }).select('book');
    const borrowedBookIds = userHistory.map(b => b.book.toString());

    let recommendedBookIds = [];

    if (borrowedBookIds.length > 0) {
      // 2. Collaborative Filtering (Users who borrowed the same books)
      // Find other users who borrowed the same books
      const coBorrowers = await BorrowRecord.find({
        book: { $in: borrowedBookIds },
        user: { $ne: userId }
      }).distinct('user');

      if (coBorrowers.length > 0) {
        // Find books borrowed by those co-borrowers that the user hasn't borrowed yet
        const coBorrowerRecommendations = await BorrowRecord.aggregate([
          { $match: { user: { $in: coBorrowers }, book: { $nin: userHistory.map(b => b.book) } } },
          { $group: { _id: '$book', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);

        recommendedBookIds = coBorrowerRecommendations.map(rec => rec._id.toString());
      }

      // 3. Content-Based Filtering Fallback (Same Category / Author)
      if (recommendedBookIds.length < 4) {
        // Fetch full book info for borrowed books to extract categories and authors
        const fullBorrowedBooks = await Book.find({ _id: { $in: borrowedBookIds } });
        const categories = fullBorrowedBooks.map(b => b.category).filter(Boolean);
        const authors = fullBorrowedBooks.map(b => b.author).filter(Boolean);

        const contentRecs = await Book.find({
          _id: { $nin: [...borrowedBookIds, ...recommendedBookIds] },
          $or: [
            { category: { $in: categories } },
            { author: { $in: authors } }
          ]
        }).limit(6 - recommendedBookIds.length).select('_id');

        recommendedBookIds = [...recommendedBookIds, ...contentRecs.map(r => r._id.toString())];
      }
    }

    // 4. Popular/Highest Rated Fallback
    if (recommendedBookIds.length < 4) {
      const remainingCount = 4 - recommendedBookIds.length;
      const popularBooks = await Book.find({
        _id: { $nin: [...borrowedBookIds, ...recommendedBookIds] }
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(remainingCount)
        .select('_id');

      recommendedBookIds = [...recommendedBookIds, ...popularBooks.map(r => r._id.toString())];
    }

    // Fetch full book objects for recommendations
    const finalRecommendations = await Book.find({ _id: { $in: recommendedBookIds } })
      .populate('category', 'name')
      .limit(6);

    res.json(finalRecommendations);
  } catch (error) {
    next(error);
  }
};

export { getRecommendations };

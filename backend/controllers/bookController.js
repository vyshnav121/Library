import Book from '../models/Book.js';
import { generateBookSummary } from '../services/aiService.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const books = await Book.find({ ...keyword }).populate('category', 'name');
    res.json(books);
  } catch (error) {
    next(error);
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name');

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin or Librarian
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, description, coverImage, totalCopies, availableCopies, location, publishedYear, status, pdfUrl } = req.body;

    const book = new Book({
      title: title || 'Sample Book Title',
      author: author || 'Sample Author',
      isbn: isbn || Date.now().toString(), // Generate a unique ISBN if not provided
      category: category,
      description: description || 'Sample description',
      coverImage: coverImage || '/images/sample.jpg',
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      location: location || 'Aisle 1',
      publishedYear: publishedYear || new Date().getFullYear(),
      status: status || 'available',
      pdfUrl: pdfUrl || null,
    });

    const createdBook = await book.save();

    // Broadcast Socket notification
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', {
        title: 'New Book Added!',
        message: `"${createdBook.title}" by ${createdBook.author} is now available in the library catalog.`,
        type: 'success',
      });
    }

    res.status(201).json(createdBook);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin or Librarian
const updateBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      coverImage,
      totalCopies,
      availableCopies,
      location,
      publishedYear,
      status,
      pdfUrl,
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.isbn = isbn || book.isbn;
      book.category = category || book.category;
      book.description = description || book.description;
      book.coverImage = coverImage || book.coverImage;
      book.totalCopies = totalCopies !== undefined ? totalCopies : book.totalCopies;
      book.availableCopies = availableCopies !== undefined ? availableCopies : book.availableCopies;
      book.location = location || book.location;
      book.publishedYear = publishedYear || book.publishedYear;
      book.status = status || book.status;
      book.pdfUrl = pdfUrl !== undefined ? pdfUrl : book.pdfUrl;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await Book.deleteOne({ _id: book._id });
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Summarize a book using AI
// @route   POST /api/books/:id/summarize
// @access  Private
const summarizeBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const summary = await generateBookSummary(book.title, book.author, book.description);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

export { getBooks, getBookById, createBook, updateBook, deleteBook, summarizeBook };

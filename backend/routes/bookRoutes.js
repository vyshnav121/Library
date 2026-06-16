import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  summarizeBook,
} from '../controllers/bookController.js';
import { protect, admin, librarian } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, librarian, createBook);
router.post('/:id/summarize', protect, summarizeBook);
router
  .route('/:id')
  .get(getBookById)
  .put(protect, librarian, updateBook)
  .delete(protect, admin, deleteBook);

export default router;

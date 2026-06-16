import express from 'express';
import {
  borrowBook,
  returnBook,
  paySimulated,
  getMyBorrowHistory,
  getMyFines,
  getAllBorrows,
  getAllFines,
  getDashboardStats,
} from '../controllers/borrowController.js';
import { protect, librarian } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, librarian, getAllBorrows)
  .post(protect, borrowBook);

router.post('/return', protect, librarian, returnBook);
router.post('/pay', protect, paySimulated);
router.get('/my-history', protect, getMyBorrowHistory);
router.get('/my-fines', protect, getMyFines);
router.get('/fines', protect, librarian, getAllFines);
router.get('/stats', protect, librarian, getDashboardStats);

export default router;

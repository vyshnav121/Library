import express from 'express';
import {
  getUsers,
  deleteUser,
  updateUser,
  getMyNotifications,
  markNotificationRead,
} from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.route('/notifications').get(protect, getMyNotifications);
router.route('/notifications/:id').put(protect, markNotificationRead);
router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;

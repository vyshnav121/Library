import express from 'express';
const router = express.Router();
import { processMessage } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/').post(protect, processMessage);

export default router;

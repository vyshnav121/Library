import express from 'express';
const router = express.Router();
import { getRecommendations } from '../controllers/recommendationController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/').get(protect, getRecommendations);

export default router;

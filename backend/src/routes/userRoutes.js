import express from 'express';
import { getUserStats, getUserDashboard } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/stats', authorize('admin'), getUserStats);
router.get('/dashboard', getUserDashboard);

export default router;

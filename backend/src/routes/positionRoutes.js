import express from 'express';
import {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  closePosition,
  deletePosition,
} from '../controllers/positionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPositions);
router.get('/:id', getPosition);

// Protected routes - Admin only
router.post('/create', authenticate, authorize('admin'), createPosition);
router.patch('/:id', authenticate, authorize('admin'), updatePosition);
router.patch('/:id/close', authenticate, authorize('admin'), closePosition);
router.delete('/:id', authenticate, authorize('admin'), deletePosition);

export default router;

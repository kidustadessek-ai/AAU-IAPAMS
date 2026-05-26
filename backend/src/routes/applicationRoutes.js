import express from 'express';
import {
  getApplications,
  getApplication,
  createApplication,
  evaluateApplication,
  updateApplicationStatus,
  deleteApplication,
  scheduleInterviews,
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadApplicationDocs, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/', getApplications);
router.post('/', uploadApplicationDocs, handleMulterError, createApplication);
router.post('/schedule-interviews', authorize('admin'), scheduleInterviews);
router.get('/:id', getApplication);
router.post('/:id/evaluate', authorize('admin', 'evaluator'), evaluateApplication);
router.patch('/:id/status', authorize('admin'), updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;

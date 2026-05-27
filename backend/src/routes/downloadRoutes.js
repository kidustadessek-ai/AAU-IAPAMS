import express from 'express';
import { downloadFile } from '../controllers/downloadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected download route
router.get('/', authenticate, downloadFile);

export default router;

import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  getUsers,
  updateUser,
  deleteUsers,
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProfilePhoto, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, changePassword);

// Admin routes
router.get('/users', authenticate, authorize('admin'), getUsers);
router.patch('/users/:id', authenticate, uploadProfilePhoto, handleMulterError, updateUser);
router.delete('/users', authenticate, authorize('admin'), deleteUsers);

export default router;

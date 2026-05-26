import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import smsService from '../services/smsService.js';

const router = express.Router();

// @desc    Send test SMS
// @route   POST /api/v1/sms/test
// @access  Private/Admin
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required',
      });
    }

    const result = await smsService.sendSMS(phoneNumber, message);

    res.json({
      success: result.success,
      message: result.success ? 'SMS sent successfully' : 'SMS sending failed',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Send interview notification
// @route   POST /api/v1/sms/interview
// @access  Private/Admin
router.post('/interview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { phoneNumber, candidateName, positionTitle, interviewDate, interviewTime } = req.body;

    if (!phoneNumber || !candidateName || !positionTitle || !interviewDate || !interviewTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const result = await smsService.sendInterviewNotification(
      phoneNumber,
      candidateName,
      positionTitle,
      interviewDate,
      interviewTime
    );

    res.json({
      success: result.success,
      message: result.success ? 'Interview notification sent' : 'SMS sending failed',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

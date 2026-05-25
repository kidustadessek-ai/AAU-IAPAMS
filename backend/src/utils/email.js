import nodemailer from 'nodemailer';
import { logger } from './logger.js';

let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    logger.warn('Email configuration incomplete. Email functionality disabled.');
  }
} catch (error) {
  logger.error('Failed to initialize email transporter', { error: error.message });
}

export const sendPasswordResetEmail = async (email, resetToken) => {
  if (!transporter) {
    logger.warn('Email not configured. Cannot send password reset email.');
    throw new Error('Email service is not configured. Please contact administrator.');
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset - AAU IAPAMS',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
        <div style="background:#7B1113;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">AAU IAPAMS</h1>
        </div>
        <div style="padding:30px;background:#f9f9f9">
          <h2 style="color:#7B1113;margin:0 0 20px">Password Reset Request</h2>
          <p style="line-height:1.6;margin:0 0 20px">You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${resetUrl}" style="display:inline-block;padding:12px 30px;background:#7B1113;color:#fff;text-decoration:none;border-radius:5px;font-weight:600">Reset Password</a>
          </div>
          <p style="font-size:12px;color:#666;margin:20px 0 0">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, username) => {
  if (!transporter) {
    logger.warn('Email not configured. Skipping welcome email.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to AAU IAPAMS',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#7B1113;padding:20px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">AAU IAPAMS</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9">
            <h2 style="color:#7B1113;margin:0 0 20px">Welcome, ${username}!</h2>
            <p style="line-height:1.6;margin:0 0 20px">Your account has been created successfully. You can now access the system.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;padding:12px 30px;background:#7B1113;color:#fff;text-decoration:none;border-radius:5px;font-weight:600">Login Now</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    // Non-critical — do not throw
  }
};

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
    subject: 'Password Reset Request - AAU IAPAMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e7d32;">Password Reset Request</h2>
        <p>You requested to reset your password for AAU Internal Academic Position Appointment Management System.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">Welcome to AAU IAPAMS!</h2>
          <p>Hello ${username},</p>
          <p>Your account has been successfully created for the Addis Ababa University Internal Academic Position Appointment Management System.</p>
          <p>You can now log in and start using the system.</p>
          <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Go to Login</a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you have any questions, please contact the administrator.</p>
        </div>
      `,
    });
  } catch (error) {
    // Non-critical — do not throw
  }
};

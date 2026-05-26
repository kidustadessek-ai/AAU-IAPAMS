import SibApiV3Sdk from 'sib-api-v3-sdk';
import { logger } from '../utils/logger.js';

const getApiInstance = () => {
  if (!process.env.BREVO_API_KEY) {
    return null;
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    return new SibApiV3Sdk.TransactionalEmailsApi();
  } catch (error) {
    logger.error('Failed to initialize Brevo', { error: error.message });
    return null;
  }
};

const AAU_BRAND = {
  primaryColor: '#7B1113',
  secondaryColor: '#1a1a2e',
  lightBg: '#fdf0f0',
  name: 'Addis Ababa University',
  address: 'P.O. Box 1176, Addis Ababa, Ethiopia',
  phone: '+251-11-123-9768',
  website: 'www.aau.edu.et'
};

const getEmailTemplate = (title, content, ctaText = null, ctaLink = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${AAU_BRAND.primaryColor} 0%,#5a0d0e 100%);padding:30px 40px;text-align:center">
              <div style="width:70px;height:70px;background:#fff;border-radius:50%;margin:0 auto 15px;display:inline-block;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.2)">
                <img src="https://raw.githubusercontent.com/kidustadessek-ai/AAU-IAPAMS/main/public/aau.png" alt="AAU" style="width:100%;height:100%;object-fit:cover;display:block">
              </div>
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">${AAU_BRAND.name}</h1>
              <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;font-size:13px">Internal Academic Position Appointment Management System</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px">
              ${content}
            </td>
          </tr>

          ${ctaText && ctaLink ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center">
              <a href="${ctaLink}" style="display:inline-block;background:${AAU_BRAND.primaryColor};color:#fff;padding:14px 40px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(123,17,19,0.3)">${ctaText}</a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:30px 40px;border-top:1px solid #e5e5e5">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding-bottom:15px">
                    <p style="margin:0;font-size:12px;color:#666;line-height:1.6">
                      ${AAU_BRAND.address}<br>
                      Phone: ${AAU_BRAND.phone} | Website: <a href="https://${AAU_BRAND.website}" style="color:${AAU_BRAND.primaryColor}">${AAU_BRAND.website}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;padding-top:15px;border-top:1px solid #e5e5e5">
                    <p style="margin:0;font-size:11px;color:#999">
                      © ${new Date().getFullYear()} ${AAU_BRAND.name}. All rights reserved.<br>
                      This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sendEmail = async (to, subject, htmlContent) => {
  const apiInstance = getApiInstance();
  
  if (!apiInstance) {
    logger.warn('Brevo not initialized. Email not sent.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { 
      name: 'AAU IAPAMS', 
      email: process.env.EMAIL_FROM || 'noreply@aau.edu.et' 
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    const errorMsg = error.response?.body?.message || error.message;
    logger.error('Email sending failed', { error: errorMsg });
    return { success: false, message: errorMsg };
  }
};

// Login Notification
export const sendLoginNotification = async (user, ipAddress, userAgent) => {
  const content = `
    <h2 style="color:${AAU_BRAND.secondaryColor};margin:0 0 20px;font-size:22px">New Login Detected</h2>
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px">
      Hello <strong>${user.fullName}</strong>,
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      We detected a new login to your account. If this was you, no action is needed.
    </p>
    
    <div style="background:${AAU_BRAND.lightBg};border-left:4px solid ${AAU_BRAND.primaryColor};padding:15px 20px;border-radius:6px;margin:20px 0">
      <table width="100%" cellpadding="5" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:13px;font-weight:600;width:120px">Time:</td>
          <td style="color:#333;font-size:13px">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;font-weight:600">IP Address:</td>
          <td style="color:#333;font-size:13px">${ipAddress || 'Unknown'}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;font-weight:600">Device:</td>
          <td style="color:#333;font-size:13px">${userAgent || 'Unknown'}</td>
        </tr>
      </table>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.7;margin:20px 0 0">
      If you didn't perform this login, please contact the system administrator immediately.
    </p>
  `;

  return sendEmail(
    user.email,
    '🔐 New Login to Your AAU IAPAMS Account',
    getEmailTemplate('Login Notification', content, 'View Dashboard', process.env.FRONTEND_URL)
  );
};

// Application Status Update
export const sendApplicationStatusUpdate = async (application, newStatus) => {
  const statusConfig = {
    pending: { icon: '⏳', color: '#f59e0b', title: 'Application Received' },
    under_review: { icon: '🔍', color: '#3b82f6', title: 'Under Review' },
    shortlisted: { icon: '⭐', color: '#10b981', title: 'Shortlisted' },
    accepted: { icon: '🎉', color: '#059669', title: 'Congratulations!' },
    rejected: { icon: '📋', color: '#ef4444', title: 'Application Update' }
  };

  const config = statusConfig[newStatus] || statusConfig.pending;

  const content = `
    <div style="text-align:center;margin:0 0 25px">
      <div style="display:inline-block;background:${config.color};color:#fff;width:60px;height:60px;border-radius:50%;line-height:60px;font-size:30px;margin-bottom:15px">${config.icon}</div>
      <h2 style="color:${AAU_BRAND.secondaryColor};margin:0;font-size:24px">${config.title}</h2>
    </div>

    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px">
      Dear <strong>${application.applicant.fullName}</strong>,
    </p>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      Your application for <strong>${application.position.title}</strong> has been updated.
    </p>

    <div style="background:${AAU_BRAND.lightBg};border-radius:8px;padding:20px;margin:20px 0">
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600;width:140px">Position:</td>
          <td style="color:#333;font-size:14px">${application.position.title}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Department:</td>
          <td style="color:#333;font-size:14px">${application.position.department}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Status:</td>
          <td>
            <span style="display:inline-block;background:${config.color};color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600">
              ${newStatus.replace('_', ' ').toUpperCase()}
            </span>
          </td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Updated:</td>
          <td style="color:#333;font-size:14px">${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</td>
        </tr>
      </table>
    </div>

    ${newStatus === 'accepted' ? `
      <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:15px;margin:20px 0">
        <p style="color:#059669;font-size:14px;margin:0;line-height:1.6">
          <strong>Next Steps:</strong> You will be contacted by the department for further instructions regarding your appointment.
        </p>
      </div>
    ` : ''}

    ${newStatus === 'rejected' ? `
      <p style="color:#555;font-size:14px;line-height:1.7;margin:20px 0 0">
        Thank you for your interest. We encourage you to apply for future positions that match your qualifications.
      </p>
    ` : ''}
  `;

  return sendEmail(
    application.applicant.email,
    `Application Update: ${application.position.title}`,
    getEmailTemplate('Application Status Update', content, 'View Application', `${process.env.FRONTEND_URL}/staff/applications`)
  );
};

// Evaluator Assignment
export const sendEvaluatorAssignment = async (evaluator, position, applicationsCount) => {
  const content = `
    <h2 style="color:${AAU_BRAND.secondaryColor};margin:0 0 20px;font-size:22px">New Evaluation Assignment</h2>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px">
      Dear <strong>${evaluator.fullName}</strong>,
    </p>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      You have been assigned as an evaluator for the following position:
    </p>

    <div style="background:${AAU_BRAND.lightBg};border-left:4px solid ${AAU_BRAND.primaryColor};padding:20px;border-radius:6px;margin:20px 0">
      <h3 style="color:${AAU_BRAND.primaryColor};margin:0 0 15px;font-size:18px">${position.title}</h3>
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600;width:150px">Department:</td>
          <td style="color:#333;font-size:14px">${position.department}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">College:</td>
          <td style="color:#333;font-size:14px">${position.college}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Applications:</td>
          <td style="color:#333;font-size:14px;font-weight:700">${applicationsCount} to review</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Deadline:</td>
          <td style="color:#333;font-size:14px">${new Date(position.deadline).toLocaleDateString('en-US', { dateStyle: 'long' })}</td>
        </tr>
      </table>
    </div>

    <div style="background:#eff6ff;border:1px solid #3b82f6;border-radius:8px;padding:15px;margin:20px 0">
      <p style="color:#1e40af;font-size:14px;margin:0;line-height:1.6">
        <strong>Action Required:</strong> Please log in to the system to review and evaluate the applications at your earliest convenience.
      </p>
    </div>
  `;

  return sendEmail(
    evaluator.email,
    `New Evaluation Assignment: ${position.title}`,
    getEmailTemplate('Evaluator Assignment', content, 'Start Evaluation', `${process.env.FRONTEND_URL}/evaluator/evaluations`)
  );
};

// Admin Notification - New Application
export const sendAdminNewApplicationNotification = async (adminEmail, application) => {
  const content = `
    <h2 style="color:${AAU_BRAND.secondaryColor};margin:0 0 20px;font-size:22px">New Application Submitted</h2>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      A new application has been submitted to the system.
    </p>

    <div style="background:${AAU_BRAND.lightBg};border-radius:8px;padding:20px;margin:20px 0">
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600;width:140px">Applicant:</td>
          <td style="color:#333;font-size:14px;font-weight:700">${application.applicant.fullName}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Email:</td>
          <td style="color:#333;font-size:14px">${application.applicant.email}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Position:</td>
          <td style="color:#333;font-size:14px">${application.position.title}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Department:</td>
          <td style="color:#333;font-size:14px">${application.position.department}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Submitted:</td>
          <td style="color:#333;font-size:14px">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail(
    adminEmail,
    `New Application: ${application.position.title}`,
    getEmailTemplate('New Application', content, 'Review Application', `${process.env.FRONTEND_URL}/admin/applications`)
  );
};

// Welcome Email
export const sendWelcomeEmail = async (user, temporaryPassword = null) => {
  const content = `
    <h2 style="color:${AAU_BRAND.secondaryColor};margin:0 0 20px;font-size:22px">Welcome to AAU IAPAMS!</h2>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px">
      Dear <strong>${user.fullName}</strong>,
    </p>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      Your account has been successfully created in the Internal Academic Position Appointment Management System.
    </p>

    <div style="background:${AAU_BRAND.lightBg};border-radius:8px;padding:20px;margin:20px 0">
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600;width:140px">Username:</td>
          <td style="color:#333;font-size:14px;font-weight:700">${user.username}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Email:</td>
          <td style="color:#333;font-size:14px">${user.email}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Role:</td>
          <td style="color:#333;font-size:14px;text-transform:capitalize">${user.role}</td>
        </tr>
        ${temporaryPassword ? `
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Temp Password:</td>
          <td style="color:${AAU_BRAND.primaryColor};font-size:14px;font-weight:700;font-family:monospace">${temporaryPassword}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${temporaryPassword ? `
      <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:15px;margin:20px 0">
        <p style="color:#dc2626;font-size:14px;margin:0;line-height:1.6">
          <strong>Important:</strong> Please change your password after your first login for security purposes.
        </p>
      </div>
    ` : ''}
  `;

  return sendEmail(
    user.email,
    'Welcome to AAU IAPAMS',
    getEmailTemplate('Welcome', content, 'Login Now', `${process.env.FRONTEND_URL}/login`)
  );
};

// Password Reset
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const content = `
    <h2 style="color:${AAU_BRAND.secondaryColor};margin:0 0 20px;font-size:22px">Password Reset Request</h2>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      You requested to reset your password. Click the button below to create a new password:
    </p>

    <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:15px;margin:20px 0">
      <p style="color:#dc2626;font-size:14px;margin:0;line-height:1.6">
        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
    </div>

    <p style="color:#999;font-size:13px;line-height:1.6;margin:20px 0 0">
      Or copy this link: <br>
      <span style="color:#666;word-break:break-all">${resetUrl}</span>
    </p>
  `;

  return sendEmail(
    email,
    'Password Reset Request - AAU IAPAMS',
    getEmailTemplate('Password Reset', content, 'Reset Password', resetUrl)
  );
};

// Interview Invitation
export const sendInterviewInvitation = async (application, interviewDetails) => {
  const content = `
    <div style="text-align:center;margin:0 0 25px">
      <div style="display:inline-block;background:#7B1113;color:#fff;width:60px;height:60px;border-radius:50%;line-height:60px;font-size:30px;margin-bottom:15px">📅</div>
      <h2 style="color:${AAU_BRAND.secondaryColor};margin:0;font-size:24px">Interview Invitation</h2>
    </div>

    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 15px">
      Dear <strong>${application.applicant.fullName}</strong>,
    </p>
    
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px">
      Congratulations! You have been shortlisted for an interview for the position of <strong>${application.position.title}</strong>.
    </p>

    <div style="background:#fdf0f0;border-left:4px solid #7B1113;padding:20px;border-radius:6px;margin:20px 0">
      <h3 style="color:#7B1113;margin:0 0 15px;font-size:18px">Interview Details</h3>
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600;width:120px">Position:</td>
          <td style="color:#333;font-size:14px">${application.position.title}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Date:</td>
          <td style="color:#333;font-size:14px;font-weight:700">${interviewDetails.date}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Time:</td>
          <td style="color:#333;font-size:14px;font-weight:700">${interviewDetails.time}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:14px;font-weight:600">Location:</td>
          <td style="color:#333;font-size:14px">${interviewDetails.location}</td>
        </tr>
      </table>
    </div>

    <div style="background:#eff6ff;border:1px solid #3b82f6;border-radius:8px;padding:15px;margin:20px 0">
      <p style="color:#1e40af;font-size:14px;margin:0;line-height:1.6">
        <strong>Important:</strong> Please arrive 15 minutes early and bring a valid ID and copies of your credentials.
      </p>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.7;margin:20px 0 0">
      We look forward to meeting you. Good luck!
    </p>
  `;

  return sendEmail(
    application.applicant.email,
    `Interview Invitation: ${application.position.title}`,
    getEmailTemplate('Interview Invitation', content, 'View Details', `${process.env.FRONTEND_URL}/staff/applications`)
  );
};

export default {
  sendLoginNotification,
  sendApplicationStatusUpdate,
  sendEvaluatorAssignment,
  sendAdminNewApplicationNotification,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInterviewInvitation
};

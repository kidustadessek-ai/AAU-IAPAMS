import axios from 'axios';

const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
const SMS_GATEWAY_USERNAME = process.env.SMS_GATEWAY_USERNAME;
const SMS_GATEWAY_PASSWORD = process.env.SMS_GATEWAY_PASSWORD;
const SMS_GATEWAY_DEVICE_ID = process.env.SMS_GATEWAY_DEVICE_ID;
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

class SMSService {
  async sendSMS(phoneNumber, message) {
    if (!SMS_ENABLED) {
      console.log('SMS disabled. Would send to:', phoneNumber);
      console.log('Message:', message);
      return { success: true, message: 'SMS disabled' };
    }

    try {
      // Android SMS Gateway v1.63.0 API
      if (SMS_GATEWAY_USERNAME && SMS_GATEWAY_PASSWORD) {
        const response = await axios.post(`${SMS_GATEWAY_URL}/message`, {
          message: message,
          phoneNumbers: [phoneNumber]
        }, {
          auth: {
            username: SMS_GATEWAY_USERNAME,
            password: SMS_GATEWAY_PASSWORD
          },
          timeout: 30000 // Increased to 30 seconds
        });
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'SMS credentials not configured' };
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      // Don't throw error, just log it so application submission continues
      return { success: false, error: error.message };
    }
  }

  async sendApplicationSubmitted(phoneNumber, candidateName, positionTitle) {
    const message = `Dear ${candidateName}, your application for ${positionTitle} has been submitted successfully. View details: ${process.env.FRONTEND_URL || 'https://AAU-IAPAMS.com'}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendApplicationApproved(phoneNumber, candidateName, positionTitle) {
    const message = `Congratulations ${candidateName}! Your application for ${positionTitle} has been approved. View details: ${process.env.FRONTEND_URL || 'https://AAU-IAPAMS.com'}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendApplicationRejected(phoneNumber, candidateName, positionTitle) {
    const message = `Dear ${candidateName}, we regret to inform you that your application for ${positionTitle} was not successful. View details: ${process.env.FRONTEND_URL || 'https://AAU-IAPAMS.com'}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendInterviewNotification(phoneNumber, candidateName, positionTitle, interviewDate, interviewTime, interviewLocation) {
    const message = `Dear ${candidateName}, you are invited for an interview for ${positionTitle} on ${interviewDate} at ${interviewTime}, Location: ${interviewLocation}. View details: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/staff/applications - AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendBulkInterviewNotifications(applications, interviewDetails) {
    const results = [];
    for (const app of applications) {
      if (app.applicant?.phone) {
        const result = await this.sendInterviewNotification(
          app.applicant.phone,
          app.applicant.fullName,
          app.position.title,
          interviewDetails.date,
          interviewDetails.time,
          interviewDetails.location
        );
        results.push({ applicationId: app._id, ...result });
      }
    }
    return results;
  }
}

export default new SMSService();

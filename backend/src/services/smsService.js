import axios from 'axios';

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'android'; // 'android' or 'africastalking'
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

// Android SMS Gateway config
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
const SMS_GATEWAY_USERNAME = process.env.SMS_GATEWAY_USERNAME;
const SMS_GATEWAY_PASSWORD = process.env.SMS_GATEWAY_PASSWORD;

// Africa's Talking config
const AT_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AT_USERNAME = process.env.AFRICASTALKING_USERNAME;
const AT_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID || 'AAU-IAPAMS';

class SMSService {
  async sendSMS(phoneNumber, message) {
    if (!SMS_ENABLED) {
      console.log('SMS disabled. Would send to:', phoneNumber);
      console.log('Message:', message);
      return { success: true, message: 'SMS disabled' };
    }

    try {
      if (SMS_PROVIDER === 'africastalking') {
        return await this.sendViaAfricasTalking(phoneNumber, message);
      } else {
        return await this.sendViaAndroidGateway(phoneNumber, message);
      }
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendViaAndroidGateway(phoneNumber, message) {
    if (!SMS_GATEWAY_USERNAME || !SMS_GATEWAY_PASSWORD) {
      return { success: false, error: 'SMS credentials not configured' };
    }

    const response = await axios.post(`${SMS_GATEWAY_URL}/message`, {
      message: message,
      phoneNumbers: [phoneNumber]
    }, {
      auth: {
        username: SMS_GATEWAY_USERNAME,
        password: SMS_GATEWAY_PASSWORD
      },
      timeout: 30000
    });
    
    return { success: true, data: response.data };
  }

  async sendViaAfricasTalking(phoneNumber, message) {
    if (!AT_API_KEY || !AT_USERNAME) {
      return { success: false, error: 'Africa\'s Talking credentials not configured' };
    }

    // Format phone number for Africa's Talking (must include country code)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+251${phoneNumber.replace(/^0+/, '')}`;

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      new URLSearchParams({
        username: AT_USERNAME,
        to: formattedPhone,
        message: message,
        from: AT_SENDER_ID
      }),
      {
        headers: {
          'apiKey': AT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    return { success: true, data: response.data };
  }

  async sendApplicationSubmitted(phoneNumber, candidateName, positionTitle) {
    const message = `Dear ${candidateName}, your application for ${positionTitle} has been submitted successfully. View details: ${process.env.FRONTEND_URL}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendApplicationApproved(phoneNumber, candidateName, positionTitle) {
    const message = `Congratulations ${candidateName}! Your application for ${positionTitle} has been approved. View details: ${process.env.FRONTEND_URL}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendApplicationRejected(phoneNumber, candidateName, positionTitle) {
    const message = `Dear ${candidateName}, we regret to inform you that your application for ${positionTitle} was not successful. View details: ${process.env.FRONTEND_URL}. AAU-IAPAMS`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendInterviewNotification(phoneNumber, candidateName, positionTitle, interviewDate, interviewTime, interviewLocation) {
    const message = `Dear ${candidateName}, you are invited for an interview for ${positionTitle} on ${interviewDate} at ${interviewTime}, Location: ${interviewLocation}. View details: ${process.env.FRONTEND_URL}/staff/applications - AAU-IAPAMS`;
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

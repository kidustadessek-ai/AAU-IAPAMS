import dotenv from 'dotenv';
import { sendLoginNotification, sendWelcomeEmail } from './src/services/emailService.js';

dotenv.config();

console.log('🧪 Testing Email Service...\n');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Set' : '❌ Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('\n---\n');

// Test user object
const testUser = {
  fullName: 'Test User',
  email: 'tedrosmilion19@gmail.com', // Your email
  username: 'testuser',
  role: 'staff'
};

console.log('📧 Sending test welcome email...');
sendWelcomeEmail(testUser)
  .then(result => {
    if (result.success) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Failed to send welcome email:', result.message);
    }
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });

console.log('\n📧 Sending test login notification...');
sendLoginNotification(testUser, '127.0.0.1', 'Mozilla/5.0 Test Browser')
  .then(result => {
    if (result.success) {
      console.log('✅ Login notification sent successfully!');
    } else {
      console.log('❌ Failed to send login notification:', result.message);
    }
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });

console.log('\n⏳ Check your email inbox (tedrosmilion19@gmail.com)...');

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'http://192.168.1.100:8080';
const SMS_GATEWAY_USERNAME = process.env.SMS_GATEWAY_USERNAME;
const SMS_GATEWAY_PASSWORD = process.env.SMS_GATEWAY_PASSWORD;
const SMS_GATEWAY_DEVICE_ID = process.env.SMS_GATEWAY_DEVICE_ID;

async function testSMSGateway() {
  console.log('🧪 Testing SMS Gateway Connection...\n');
  console.log(`Gateway URL: ${SMS_GATEWAY_URL}`);
  console.log(`Username: ${SMS_GATEWAY_USERNAME || 'Not set'}`);
  console.log(`Device ID: ${SMS_GATEWAY_DEVICE_ID || 'Not set'}\n`);

  try {
    if (SMS_GATEWAY_USERNAME && SMS_GATEWAY_PASSWORD) {
      console.log('Testing Android SMS Gateway v1.63.0...');
      
      const response = await axios.post(`${SMS_GATEWAY_URL}/message`, {
        message: 'Test SMS from AAU-IAPAMS',
        phoneNumbers: ['+251942846893']
      }, {
        auth: {
          username: SMS_GATEWAY_USERNAME,
          password: SMS_GATEWAY_PASSWORD
        },
        timeout: 10000
      });

      console.log('✅ SMS Gateway Test Successful!');
      console.log('Response:', response.data);
    } else {
      console.error('❌ Missing credentials!');
      console.error('\nPlease set in .env file:');
      console.error('SMS_GATEWAY_USERNAME=your-username');
      console.error('SMS_GATEWAY_PASSWORD=your-password');
      console.error('SMS_GATEWAY_DEVICE_ID=your-device-id');
    }
  } catch (error) {
    console.error('❌ SMS Gateway Test Failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Please check:');
      console.error('   1. SMS Gateway app is running on your phone');
      console.error('   2. Phone IP address is correct in .env');
      console.error('   3. Phone and computer are on same network');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection timeout. Please check:');
      console.error('   1. Phone is connected to network');
      console.error('   2. Firewall is not blocking the connection');
    } else if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication failed. Please check:');
      console.error('   1. Username is correct: sms');
      console.error('   2. Password is correct');
      console.error('   3. Check app settings for credentials');
    } else {
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
      }
    }
  }
}

testSMSGateway();

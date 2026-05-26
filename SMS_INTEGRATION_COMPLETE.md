# Android SMS Gateway Integration - Complete Guide

## ✅ Integration Complete

Your AAU-IAPAMS system now supports SMS notifications via Android phone gateway.

---

## 📱 What Was Implemented

### Backend Changes

1. **SMS Service** (`backend/src/services/smsService.js`)
   - Handles all SMS sending logic
   - Methods for application submission, approval, rejection, and interview notifications
   - Error handling and logging

2. **SMS Routes** (`backend/src/routes/smsRoutes.js`)
   - `POST /api/v1/sms/test` - Send test SMS
   - `POST /api/v1/sms/interview` - Send interview notification

3. **Application Controller Updates** (`backend/src/controllers/applicationController.js`)
   - Auto-send SMS on application submission
   - Auto-send SMS on approval/rejection

4. **Environment Variables** (`backend/.env`)
   ```env
   SMS_GATEWAY_URL=http://192.168.1.100:8080
   SMS_GATEWAY_API_KEY=your-api-key-here
   SMS_ENABLED=true
   ```

### Frontend Changes

5. **SMS Test Component** (`src/components/SMSTestPanel.jsx`)
   - Admin panel to test SMS sending
   - Can be integrated into admin dashboard

### Documentation

6. **Setup Guide** (`backend/SMS_GATEWAY_SETUP.md`)
   - Complete setup instructions
   - Troubleshooting guide
   - Production deployment options

7. **Test Script** (`backend/test-sms.js`)
   - Quick test for SMS gateway connectivity

---

## 🚀 Quick Start

### Step 1: Install Android App

**Recommended**: SMS Gateway for Android (Free)
- Download: [GitHub](https://github.com/capcom6/android-sms-gateway) or Google Play
- Install on Android phone
- Grant SMS permissions

### Step 2: Configure Android App

1. Open app
2. Enable "Local Server"
3. Note IP address (e.g., `192.168.1.100:8080`)
4. Set API key (e.g., `my-secure-key-123`)
5. Enable "Auto-start on boot"

### Step 3: Update Backend Config

Edit `backend/.env`:
```env
SMS_GATEWAY_URL=http://192.168.1.100:8080
SMS_GATEWAY_API_KEY=my-secure-key-123
SMS_ENABLED=true
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Test Connection

```bash
cd backend
node test-sms.js
```

Expected output:
```
✅ SMS Gateway Test Successful!
```

### Step 6: Start Backend

```bash
npm start
```

---

## 📨 Automatic SMS Notifications

The system automatically sends SMS for:

### 1. Application Submission
**Trigger**: When candidate submits application
**Message**: "Dear {name}, your application for {position} has been submitted successfully. AAU-IAPAMS"

### 2. Application Approved
**Trigger**: When admin approves application
**Message**: "Congratulations {name}! Your application for {position} has been approved. AAU-IAPAMS"

### 3. Application Rejected
**Trigger**: When admin rejects application
**Message**: "Dear {name}, we regret to inform you that your application for {position} was not successful. AAU-IAPAMS"

### 4. Interview Notification
**Trigger**: Manual via API
**Message**: "Dear {name}, you are invited for an interview for {position} on {date} at {time}. AAU-IAPAMS"

---

## 🧪 Testing

### Test 1: Direct Gateway Test

```bash
curl -X POST http://192.168.1.100:8080/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251911234567",
    "message": "Test from AAU-IAPAMS",
    "apiKey": "my-secure-key-123"
  }'
```

### Test 2: Backend API Test

```bash
# Get admin token first (login as admin)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aau.edu.et",
    "password": "Admin@123"
  }'

# Use token to send test SMS
curl -X POST http://localhost:5000/api/v1/sms/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "phoneNumber": "+251911234567",
    "message": "Test SMS from Backend"
  }'
```

### Test 3: Frontend Test

1. Login as admin
2. Add `<SMSTestPanel />` to admin dashboard
3. Enter phone number and message
4. Click "Send Test SMS"

---

## 🌐 Production Deployment

### Option 1: Local Network (Simplest)
- Keep phone on office WiFi
- Use static IP for phone
- Backend must be on same network
- **Best for**: Small office setup

### Option 2: Port Forwarding
- Configure router to forward port 8080
- Use public IP or domain
- Update `SMS_GATEWAY_URL` to public address
- **Best for**: Remote access needed

### Option 3: VPN Tunnel (Most Secure)
- Set up VPN between server and phone
- Use VPN IP in configuration
- **Best for**: Production security

### Option 4: Cloud Relay
- Deploy relay server on AWS/Azure
- Phone connects to relay
- Backend connects to relay
- **Best for**: High availability

---

## 📞 Phone Number Format

Always use international format:
- ✅ `+251911234567` (Ethiopia)
- ✅ `+1234567890` (USA)
- ❌ `0911234567` (Won't work)

---

## 💰 Cost

- **App**: 100% Free (open source)
- **SMS Charges**: Standard carrier rates
- **Recommendation**: Use unlimited SMS plan

---

## 🔒 Security

1. Use strong API keys (20+ characters)
2. Enable HTTPS in production
3. Restrict API to backend IP only
4. Monitor SMS logs
5. Set rate limits
6. Keep phone physically secure

---

## 🐛 Troubleshooting

### SMS Not Sending

```bash
# Check phone connectivity
ping 192.168.1.100

# Check backend logs
npm start
# Look for "SMS sending failed"

# Test gateway directly
node test-sms.js
```

### Common Issues

1. **Connection Refused**
   - App not running on phone
   - Wrong IP address
   - Different networks

2. **Timeout**
   - Phone offline
   - Firewall blocking port 8080
   - Network issues

3. **API Key Error**
   - Mismatch between .env and app
   - Check both carefully

---

## 📚 API Reference

### Send Test SMS
```http
POST /api/v1/sms/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "phoneNumber": "+251911234567",
  "message": "Your message"
}
```

### Send Interview Notification
```http
POST /api/v1/sms/interview
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "phoneNumber": "+251911234567",
  "candidateName": "John Doe",
  "positionTitle": "Assistant Professor",
  "interviewDate": "2024-02-15",
  "interviewTime": "10:00 AM"
}
```

---

## 🔄 Alternative Solutions

If Android gateway doesn't work:

1. **Twilio** (Paid, most reliable)
   - Cost: ~$0.0075/SMS
   - Setup: 5 minutes
   - Best for production

2. **Africa's Talking** (Africa-focused)
   - Good for Ethiopian numbers
   - Competitive pricing

3. **SMS Gateway API** (Freemium)
   - 100 free SMS/month
   - Cloud-based

---

## 📝 Next Steps

1. ✅ Install Android app
2. ✅ Configure app settings
3. ✅ Update .env file
4. ✅ Run `npm install`
5. ✅ Test with `node test-sms.js`
6. ✅ Start backend
7. ✅ Test via API
8. ✅ Deploy to production

---

## 📞 Support

- Documentation: `SMS_GATEWAY_SETUP.md`
- API Reference: `API_REFERENCE.md`
- Email: support@aau-iapms.com

---

## ✨ Features

- ✅ Free and open source
- ✅ No monthly fees
- ✅ Complete control
- ✅ Works offline (local network)
- ✅ Automatic notifications
- ✅ Manual SMS sending
- ✅ Error handling
- ✅ Logging
- ✅ Easy testing
- ✅ Production ready

---

**Integration Status**: ✅ Complete and Ready to Use

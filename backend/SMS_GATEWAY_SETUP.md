# Android SMS Gateway Integration Guide

## Overview
This guide explains how to set up an Android phone as an SMS gateway for AAU-IAPAMS to send automated SMS notifications.

## Recommended Solution: SMS Gateway for Android (Free & Open Source)

### Option 1: SMS Gateway for Android (Recommended)
**App**: [SMS Gateway for Android](https://github.com/capcom6/android-sms-gateway)
**Cost**: Free & Open Source
**Features**: REST API, Local server, No cloud dependency

### Option 2: SMS Gateway API
**App**: [SMS Gateway API](https://smsgateway.me/)
**Cost**: Free tier available
**Features**: Cloud-based, Mobile app + Web dashboard

---

## Setup Instructions (SMS Gateway for Android)

### Step 1: Install the App

1. Download from Google Play Store or GitHub releases
2. Install on your Android phone
3. Grant SMS and notification permissions

### Step 2: Configure the App

1. Open the app
2. Go to **Settings**
3. Enable **Local Server**
4. Note the IP address and port (e.g., `192.168.1.100:8080`)
5. Set an API key (e.g., `your-secure-api-key-123`)
6. Enable **Auto-start on boot** (optional)

### Step 3: Update Backend Configuration

Update your `.env` file:

```env
# SMS Gateway Configuration
SMS_GATEWAY_URL=http://192.168.1.100:8080
SMS_GATEWAY_API_KEY=your-secure-api-key-123
SMS_ENABLED=true
```

**Important Notes:**
- Replace `192.168.1.100` with your Android phone's local IP address
- Keep your phone and server on the same network for local testing
- For production, use a static IP or domain with port forwarding

### Step 4: Test the Integration

#### Test 1: Direct API Test (using curl)

```bash
curl -X POST http://192.168.1.100:8080/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251911234567",
    "message": "Test SMS from AAU-IAPAMS",
    "apiKey": "your-secure-api-key-123"
  }'
```

#### Test 2: Backend API Test

Start your backend server:
```bash
cd backend
npm start
```

Send test SMS via API:
```bash
curl -X POST http://localhost:5000/api/v1/sms/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "phoneNumber": "+251911234567",
    "message": "Test SMS from AAU-IAPAMS Backend"
  }'
```

---

## Production Deployment

### Option 1: Local Network (Simple)
- Keep Android phone on office WiFi
- Use static IP for the phone
- Backend server must be on same network

### Option 2: Port Forwarding (Remote Access)
1. Configure router to forward port 8080 to Android phone
2. Use your public IP or domain
3. Update `SMS_GATEWAY_URL` to `http://YOUR_PUBLIC_IP:8080`
4. **Security**: Use HTTPS and strong API keys

### Option 3: VPN Tunnel (Secure)
1. Set up VPN between server and Android phone
2. Use VPN IP address in configuration
3. More secure for production

### Option 4: Cloud Relay (Advanced)
1. Deploy a relay server on AWS/Azure
2. Android app connects to relay
3. Backend connects to relay
4. Best for scalability

---

## API Endpoints

### 1. Send Test SMS
```http
POST /api/v1/sms/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "phoneNumber": "+251911234567",
  "message": "Your test message"
}
```

### 2. Send Interview Notification
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

## Automatic SMS Triggers

The system automatically sends SMS for:

1. **Application Submission**
   - Triggered when candidate submits application
   - Message: "Dear {name}, your application for {position} has been submitted successfully."

2. **Application Approved**
   - Triggered when admin approves application
   - Message: "Congratulations {name}! Your application for {position} has been approved."

3. **Application Rejected**
   - Triggered when admin rejects application
   - Message: "Dear {name}, we regret to inform you that your application for {position} was not successful."

4. **Interview Notification**
   - Triggered manually via API
   - Message: "Dear {name}, you are invited for an interview for {position} on {date} at {time}."

---

## Troubleshooting

### SMS Not Sending

1. **Check phone connectivity**
   ```bash
   ping 192.168.1.100
   ```

2. **Verify app is running**
   - Open app on Android
   - Check server status is "Running"

3. **Check API key**
   - Ensure `.env` API key matches app settings

4. **Check logs**
   ```bash
   # Backend logs
   npm start
   
   # Look for "SMS sending failed" messages
   ```

### Phone Not Reachable

1. **Check IP address**
   - Android Settings → About Phone → Status → IP Address
   - Update `.env` if changed

2. **Check firewall**
   - Ensure port 8080 is not blocked
   - Disable phone firewall temporarily for testing

3. **Check network**
   - Both devices must be on same network
   - Try connecting from browser: `http://192.168.1.100:8080`

---

## Phone Number Format

Use international format:
- ✅ `+251911234567` (Ethiopia)
- ✅ `+1234567890` (USA)
- ❌ `0911234567` (Local format - may not work)

---

## Cost Considerations

- **SMS Gateway for Android**: 100% Free
- **SMS Charges**: Standard carrier SMS rates apply
- **Recommendation**: Use unlimited SMS plan or business SIM

---

## Security Best Practices

1. **Use strong API keys** (minimum 20 characters)
2. **Enable HTTPS** for production
3. **Restrict API access** to backend server IP only
4. **Monitor SMS logs** for suspicious activity
5. **Set rate limits** to prevent abuse
6. **Keep phone physically secure**

---

## Alternative Solutions

### If Android Gateway Doesn't Work:

1. **Twilio** (Paid, reliable)
   - Cost: ~$0.0075 per SMS
   - Setup: 5 minutes
   - Best for production

2. **Africa's Talking** (Paid, Africa-focused)
   - Cost: Varies by country
   - Good for Ethiopian numbers

3. **SMS Gateway API** (Freemium)
   - Free tier: 100 SMS/month
   - Requires cloud connectivity

---

## Support

For issues or questions:
- Check app logs on Android
- Check backend logs: `npm start`
- Review API documentation: `API_REFERENCE.md`
- Contact: support@aau-iapms.com

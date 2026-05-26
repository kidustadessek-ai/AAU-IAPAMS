# SMS Gateway Configuration Guide

## Your SMS Gateway App Details

You have the following information from your app:
- **Local Address** (e.g., `192.168.1.100:8080`)
- **Public Address** (e.g., `https://smsgateway.me`)
- **Username**
- **Password**
- **Device ID**

---

## 🎯 Which Configuration to Use?

### Option 1: LOCAL ADDRESS (Recommended for Testing)

**Use when:**
- Your backend server and phone are on the same WiFi network
- You want free, fast, local communication
- Testing locally

**Configuration:**
```env
SMS_GATEWAY_URL=http://172.17.50.62:8080
SMS_GATEWAY_USERNAME=your-username
SMS_GATEWAY_PASSWORD=your-password
SMS_GATEWAY_DEVICE_ID=your-device-id
SMS_ENABLED=true
```

**Note:** Replace `172.17.50.62:8080` with YOUR local address from the app.

---

### Option 2: PUBLIC ADDRESS (For Production/Remote)

**Use when:**
- Your backend server is deployed remotely (AWS, Azure, etc.)
- Phone and server are on different networks
- You need internet-based communication

**Configuration:**
```env
SMS_GATEWAY_URL=https://smsgateway.me
SMS_GATEWAY_USERNAME=your-username
SMS_GATEWAY_PASSWORD=your-password
SMS_GATEWAY_DEVICE_ID=your-device-id
SMS_ENABLED=true
```

---

## 📝 Step-by-Step Setup

### Step 1: Get Your Credentials from the App

Open your SMS Gateway app and note:
1. **Local Address**: `http://172.17.50.62:8080` (example)
2. **Public Address**: `https://smsgateway.me` (example)
3. **Username**: Your account username
4. **Password**: Your account password
5. **Device ID**: Unique device identifier

### Step 2: Update `.env` File

Edit `backend/.env` and replace with YOUR actual values:

```env
# SMS Gateway Configuration
SMS_GATEWAY_URL=http://YOUR_LOCAL_ADDRESS:8080
SMS_GATEWAY_USERNAME=YOUR_USERNAME
SMS_GATEWAY_PASSWORD=YOUR_PASSWORD
SMS_GATEWAY_DEVICE_ID=YOUR_DEVICE_ID
SMS_ENABLED=true
```

**Example:**
```env
SMS_GATEWAY_URL=http://172.17.50.62:8080
SMS_GATEWAY_USERNAME=john.doe@example.com
SMS_GATEWAY_PASSWORD=mySecurePass123
SMS_GATEWAY_DEVICE_ID=12345
SMS_ENABLED=true
```

### Step 3: Test Connection

```bash
cd backend
node test-sms.js
```

---

## 🔍 Understanding Each Field

### Local Address
- **What**: Your phone's IP address on local network
- **Format**: `http://192.168.x.x:8080` or `http://172.17.x.x:8080`
- **Use**: When phone and server are on same WiFi
- **Example**: `http://172.17.50.62:8080`

### Public Address
- **What**: Cloud service URL
- **Format**: `https://smsgateway.me` or similar
- **Use**: When phone and server are on different networks
- **Example**: `https://smsgateway.me`

### Username
- **What**: Your account login username/email
- **Use**: Authentication for cloud service
- **Example**: `john.doe@example.com`

### Password
- **What**: Your account password
- **Use**: Authentication for cloud service
- **Example**: `mySecurePass123`

### Device ID
- **What**: Unique identifier for your phone
- **Use**: Tells the service which device to use for sending
- **Example**: `12345` or `device-abc-123`

---

## ⚡ Quick Decision Guide

**Are your phone and backend server on the same WiFi?**

✅ **YES** → Use **LOCAL ADDRESS**
```env
SMS_GATEWAY_URL=http://172.17.50.62:8080
```

❌ **NO** → Use **PUBLIC ADDRESS**
```env
SMS_GATEWAY_URL=https://smsgateway.me
```

**Both options need:**
- Username
- Password
- Device ID

---

## 🧪 Testing

### Test 1: Check if Phone is Reachable (Local Only)

```bash
# Replace with your local address
ping 172.17.50.62
```

### Test 2: Test SMS Sending

```bash
cd backend
node test-sms.js
```

### Test 3: Test via API

```bash
# Login as admin first
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aau.edu.et","password":"Admin@123"}'

# Copy the token from response, then:
curl -X POST http://localhost:5000/api/v1/sms/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+251911234567","message":"Test SMS"}'
```

---

## 🚨 Troubleshooting

### "Connection Refused" Error

**If using LOCAL address:**
1. Check phone and computer are on same WiFi
2. Verify local address is correct in app
3. Ensure app server is running
4. Try pinging the address: `ping 172.17.50.62`

**If using PUBLIC address:**
1. Check internet connection
2. Verify username/password are correct
3. Ensure device ID is correct
4. Check if app is connected to cloud service

### "Authentication Failed" Error

1. Double-check username in `.env`
2. Double-check password in `.env`
3. Verify credentials work in the app
4. Try logging out and back in to the app

### "Device Not Found" Error

1. Verify device ID in `.env` matches app
2. Check if device is registered in cloud service
3. Try restarting the app

---

## 💡 Recommendation

**For your setup (local address: 172.17.50.62:8080):**

Start with **LOCAL ADDRESS** for testing:

```env
SMS_GATEWAY_URL=http://172.17.50.62:8080
SMS_GATEWAY_USERNAME=your-username
SMS_GATEWAY_PASSWORD=your-password
SMS_GATEWAY_DEVICE_ID=your-device-id
SMS_ENABLED=true
```

Once working locally, switch to **PUBLIC ADDRESS** for production deployment.

---

## 📞 Summary

**There is NO separate "API Key"** - your authentication uses:
- Username
- Password
- Device ID

These three together authenticate your requests to send SMS.

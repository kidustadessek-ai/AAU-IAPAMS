# Brevo Email Setup Guide

## ✅ Email Service is Working!

The email system is now successfully integrated and sending emails.

## 📧 Email Types Implemented

1. **Login Notification** - Sent when user logs in
2. **Application Status Update** - Sent when admin changes application status
3. **Evaluator Assignment** - Sent when evaluators are assigned to positions
4. **Admin New Application** - Sent to admins when new application submitted
5. **Welcome Email** - Sent when new user account created
6. **Password Reset** - Sent when user requests password reset

## 🔧 Configuration

### Current Setup (.env)
```
BREVO_API_KEY=your-brevo-api-key-here
EMAIL_FROM=your-email@example.com
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

Run the test script:
```bash
cd backend
node test-email.js
```

Expected output:
```
✅ Welcome email sent successfully!
✅ Login notification sent successfully!
```

## 📬 Check Your Inbox

Emails sent to: **your-email@example.com**

Check:
- Inbox
- Spam folder (if not in inbox)
- Promotions tab (Gmail)

## 🎨 Email Features

All emails include:
- AAU logo and branding
- Professional gradient header (#7B1113)
- Responsive design (mobile-friendly)
- Call-to-action buttons
- University contact information
- Security notices

## 🚀 How to Trigger Emails

### 1. Login Notification
```bash
# Login via API or frontend
POST http://localhost:5000/api/v1/auth/login
{
  "username": "staff1",
  "password": "Staff@123"
}
```

### 2. Application Status Update
```bash
# Admin updates status
PATCH http://localhost:5000/api/v1/applications/:applicationId/status
{
  "status": "shortlisted"
}
```

### 3. Evaluator Assignment
```bash
# Admin assigns evaluators
PATCH http://localhost:5000/api/v1/positions/:positionId
{
  "evaluators": ["evaluatorId1", "evaluatorId2"]
}
```

### 4. New Application
```bash
# Staff submits application
POST http://localhost:5000/api/v1/applications
# (with multipart form data)
```

### 5. Welcome Email
```bash
# Admin creates user
POST http://localhost:5000/api/v1/auth/register
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "New User",
  "role": "staff",
  "department": "Computer Science"
}
```

### 6. Password Reset
```bash
# User requests reset
POST http://localhost:5000/api/v1/auth/forgot-password
{
  "email": "user@example.com"
}
```

## 📊 Brevo Dashboard

Monitor your emails:
1. Go to https://app.brevo.com/
2. Navigate to **Transactional** → **Email**
3. View sent emails, delivery status, opens, clicks

## 🔒 Important Notes

### Sender Email Verification
- Current sender: `tedrosmilion19@gmail.com`
- For production, verify your domain in Brevo
- Add SPF/DKIM records for better deliverability

### API Limits (Free Plan)
- 300 emails/day
- Upgrade for more: https://www.brevo.com/pricing/

### Email Deliverability
- Emails may go to spam initially
- Verify sender domain for better delivery
- Recipients should whitelist sender

## 🐛 Troubleshooting

### Emails not received?
1. Check spam/junk folder
2. Verify email address is correct
3. Check Brevo dashboard for delivery status
4. Check backend console for errors

### "Unauthorized" error?
- API key is invalid or expired
- Generate new key in Brevo dashboard

### Emails in spam?
- Verify sender domain in Brevo
- Add SPF/DKIM DNS records
- Use verified domain email

## ✨ Next Steps

1. ✅ Test all 6 email types
2. ✅ Verify emails arrive in inbox
3. ✅ Check email design on mobile
4. ⬜ Verify sender domain (for production)
5. ⬜ Set up SPF/DKIM records (for production)
6. ⬜ Monitor email analytics in Brevo

## 📞 Support

- Brevo Support: https://help.brevo.com/
- API Documentation: https://developers.brevo.com/

---

**Status**: ✅ WORKING
**Last Tested**: 2025-05-25
**Test Email**: your-email@example.com

# 🚀 START HERE - AAU IAPAMS Backend

Welcome to the AAU Internal Academic Position Appointment Management System Backend!

## 📋 What You Have

A **complete, production-ready backend API** for managing academic position appointments with:
- ✅ 23 API endpoints
- ✅ User authentication & authorization
- ✅ Position management
- ✅ Application system with file uploads
- ✅ Multi-evaluator scoring system
- ✅ Email notifications
- ✅ Complete documentation

## 🎯 Quick Navigation

### For First-Time Setup
👉 **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes

### For API Documentation
👉 **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation with examples

### For Deployment
👉 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production (Heroku, AWS, etc.)

### For Project Overview
👉 **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

### For Implementation Details
👉 **[README.md](README.md)** - Full technical documentation

### For Verification
👉 **[CHECKLIST.md](CHECKLIST.md)** - Implementation checklist

## ⚡ Super Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env` and update:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

### 5. Test
Visit: `http://localhost:5000/health`

Login with: `admin` / `Admin@123`

## 📚 Documentation Structure

```
backend/
├── START_HERE.md           ← You are here!
├── QUICK_START.md          ← 5-minute setup guide
├── README.md               ← Complete documentation
├── API_REFERENCE.md        ← All API endpoints
├── DEPLOYMENT.md           ← Production deployment
├── PROJECT_SUMMARY.md      ← Project overview
├── CHECKLIST.md            ← Implementation status
└── AAU-IAPAMS.postman_collection.json  ← API testing
```

## 🎓 What This System Does

### For Administrators
- Create and manage academic positions
- Assign evaluators to positions
- Manage users (staff, evaluators)
- View system-wide statistics
- Manage applications

### For Evaluators
- View applications for assigned positions
- Evaluate applications with scoring (0-10)
- Submit evaluation comments
- View evaluation dashboard

### For Staff
- Browse open positions
- Apply for positions with documents
- Upload CV, cover letter, certificates
- Track application status
- View personal dashboard

## 🔐 Default Test Accounts

After running `npm run seed`:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| Evaluator | evaluator1 | Evaluator@123 |
| Staff | staff1 | Staff@123 |

## 🛠️ What You Need

### Required
1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **MongoDB** - Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)
3. **Cloudinary Account** - [Sign up](https://cloudinary.com) (free)
4. **Gmail Account** - For sending emails

### Optional
- **Postman** - For API testing
- **MongoDB Compass** - For database visualization
- **VS Code** - Recommended code editor

## 📊 System Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────┐
│     Express.js Backend          │
│  ┌──────────────────────────┐  │
│  │  Authentication (JWT)    │  │
│  ├──────────────────────────┤  │
│  │  Position Management     │  │
│  ├──────────────────────────┤  │
│  │  Application System      │  │
│  ├──────────────────────────┤  │
│  │  File Upload (Cloudinary)│  │
│  ├──────────────────────────┤  │
│  │  Email (Nodemailer)      │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
    ┌────┴────┬──────────┬─────────┐
    ▼         ▼          ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│MongoDB │ │Cloudinary│ │ Gmail  │ │  JWT   │
└────────┘ └────────┘ └────────┘ └────────┘
```

## 🎯 API Endpoints Overview

### Authentication (9 endpoints)
- Register, Login, Password Management
- User CRUD operations

### Positions (6 endpoints)
- Create, Read, Update, Delete positions
- Close positions for applications

### Applications (6 endpoints)
- Submit applications with documents
- Evaluate applications
- Manage application status

### Statistics (2 endpoints)
- System-wide statistics
- User dashboard

**Total: 23 API Endpoints**

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based authorization
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ File upload validation

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Security:** Helmet, CORS, Rate Limiting

## 🚀 Next Steps

### Step 1: Setup (5 minutes)
Follow **[QUICK_START.md](QUICK_START.md)**

### Step 2: Test API
Import **AAU-IAPAMS.postman_collection.json** into Postman

### Step 3: Connect Frontend
Update frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 4: Deploy
Follow **[DEPLOYMENT.md](DEPLOYMENT.md)** when ready

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `.env`
- For Atlas: Check network access settings

### Cloudinary Upload Error
- Verify credentials in `.env`
- Check Cloudinary dashboard

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable 2FA on Google account
- Check SMTP settings

### Port Already in Use
Change port in `.env`:
```env
PORT=5001
```

## 📞 Need Help?

1. Check **[QUICK_START.md](QUICK_START.md)** troubleshooting section
2. Review **[README.md](README.md)** for detailed docs
3. Check server console logs
4. Verify all environment variables

## ✨ Features Highlights

### 🔐 Authentication
- Secure JWT-based authentication
- Password reset via email
- Role-based access control

### 📝 Position Management
- Create academic positions
- Set deadlines and requirements
- Assign evaluators
- Auto-close on deadline

### 📄 Application System
- Upload CV, cover letter, certificates
- Multi-evaluator scoring (0-10)
- Automatic average calculation
- Status tracking

### 📊 Statistics
- System-wide analytics
- User dashboards
- Application trends
- Department statistics

### 📧 Email Notifications
- Password reset emails
- Welcome emails
- HTML templates

## 🎓 Academic Project Info

**Institution:** Addis Ababa University  
**Program:** BSc Software Engineering  
**Type:** Final Year Project  
**Status:** ✅ Complete & Production Ready

## 📈 Project Stats

- **Lines of Code:** ~3,000+
- **Files Created:** 25+
- **API Endpoints:** 23
- **Database Models:** 3
- **Controllers:** 4
- **Routes:** 4
- **Middleware:** 3
- **Utilities:** 4
- **Documentation Pages:** 7

## 🎉 You're Ready!

Everything is set up and ready to go. Just:

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure `.env` file
3. ✅ Seed database (`npm run seed`)
4. ✅ Start server (`npm run dev`)
5. ✅ Test with Postman

**Happy Coding! 🚀**

---

## 📚 Quick Reference

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm run seed         # Seed database with sample data
```

### URLs
```
Health Check:  http://localhost:5000/health
API Base:      http://localhost:5000/api/v1
```

### Default Login
```
Username: admin
Password: Admin@123
```

### Environment Variables
```
MONGODB_URI          # Database connection
JWT_ACCESS_SECRET    # JWT secret
CLOUDINARY_*         # File upload (3 values)
EMAIL_*              # Email service (2 values)
```

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅

**Need more details?** Check the other documentation files! 📚

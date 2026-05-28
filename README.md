# AAU-IAPAMS

<div align="center">
  <img src="public/aau.png" alt="AAU Logo" width="120"/>
  <h3>Addis Ababa University</h3>
  <h1>Internal Academic Position Appointment Management System</h1>
  <p>A comprehensive web-based platform for streamlining internal academic position appointments, candidate management, and evaluation processes.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AAU-IAPAMS is a modern, full-stack web application designed to digitize and streamline the internal academic position appointment process at Addis Ababa University. The system provides role-based access control, automated workflows, real-time notifications, and comprehensive reporting capabilities.

### Problem Statement
Traditional paper-based appointment processes are time-consuming, error-prone, and difficult to track. AAU-IAPAMS addresses these challenges by providing a centralized, digital platform for managing the entire appointment lifecycle.

### Solution
A secure, scalable web application that automates position posting, application submission, evaluation, and appointment tracking with real-time notifications and comprehensive audit trails.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure JWT-based authentication** with access and refresh tokens
- **Role-based access control (RBAC)** for Admin, Staff, and Evaluator roles
- **Password reset functionality** with email verification
- **Session management** with automatic token refresh

### 👥 User Management
- **Comprehensive user profiles** with education, experience, and skills
- **Profile photo upload** with Cloudinary integration
- **Real-time profile completeness tracking**
- **Social media integration** (LinkedIn, GitHub, Twitter)
- **Phone number management** for SMS notifications

### 📢 Position Management
- **Create and publish** internal academic positions
- **Position categorization** by department and type
- **Application deadline management**
- **Position status tracking** (Open, Closed, Filled)
- **Document attachment support** for position descriptions

### 📝 Application Management
- **Online application submission** with document uploads (CV, Cover Letter, Certificates)
- **Application status tracking** (Pending, Under Review, Accepted, Rejected)
- **Document preview** for PDF, DOCX, and images
- **Application history** and audit trail
- **Bulk application management** for administrators

### 📊 Evaluation System
- **Multi-evaluator assignment** for each position
- **Structured evaluation criteria** and scoring
- **Evaluation progress tracking**
- **Evaluator dashboard** with pending assignments
- **Evaluation reports** and analytics

### 📧 Notification System
- **Email notifications** via Brevo (SendinBlue) integration
  - Welcome emails for new users
  - Application submission confirmations
  - Status update notifications
  - Interview invitations
- **SMS notifications** via Android SMS Gateway
  - Application status updates
  - Interview reminders
  - Urgent notifications
- **In-app notifications** for real-time updates

### 📈 Dashboard & Analytics
- **Role-specific dashboards** with relevant metrics
- **Visual analytics** with charts and graphs
- **Application statistics** and trends
- **Position performance metrics**
- **User activity tracking**

### 🎨 User Interface
- **Modern, responsive design** with Tailwind CSS
- **Smooth animations** with Framer Motion
- **Intuitive navigation** with role-based menus
- **Dark mode support** (coming soon)
- **Mobile-friendly** interface

### 🔒 Security Features
- **Password hashing** with bcrypt
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS protection**
- **Helmet.js** security headers
- **Environment variable protection**

---

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Zustand** - State management
- **Formik & Yup** - Form handling and validation
- **PDF.js & Mammoth** - Document preview

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for images
- **Nodemailer** - Email sending
- **Brevo API** - Transactional emails
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### DevOps & Tools
- **Git** - Version control
- **GitHub** - Code repository
- **Postman** - API testing
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (React SPA - Vite, Tailwind CSS, Framer Motion)           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
┌────────────────────▼────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  (Express.js - CORS, Helmet, Rate Limiting, JWT Auth)      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
│   Business   │ │  Auth   │ │ Notification│
│    Logic     │ │ Service │ │   Service   │
└───────┬──────┘ └──┬──────┘ └──┬──────────┘
        │           │            │
┌───────▼───────────▼────────────▼──────────┐
│           Data Access Layer                │
│         (Mongoose ODM)                     │
└───────────────────┬────────────────────────┘
                    │
┌───────────────────▼────────────────────────┐
│          MongoDB Database                  │
│  (Users, Positions, Applications,          │
│   Evaluations, Notifications)              │
└────────────────────────────────────────────┘

External Services:
├── Cloudinary (Image Storage)
├── Brevo (Email Service)
└── Android SMS Gateway (SMS Service)
```

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Local or Atlas
- **Git**
- **npm** or **yarn**

### Step 1: Clone the Repository
```bash
git clone https://github.com/teddymillion/AAU-IAPAMS.git
cd AAU-IAPAMS
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 4: Environment Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

#### Backend (backend/.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/aau-iapams
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aau-iapams

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_RESET_SECRET=your-super-secret-reset-key-change-this

# JWT Expiration
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_EXPIRES_IN=1h

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo Email Service
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=AAU IAPAMS

# SMS Gateway (Optional)
SMS_ENABLED=false
SMS_GATEWAY_URL=http://your-android-device-ip:8080
SMS_GATEWAY_USERNAME=admin
SMS_GATEWAY_PASSWORD=your-password
SMS_GATEWAY_DEVICE_ID=your-device-id
```

### Step 5: Seed Database (Optional)
```bash
cd backend
npm run seed
cd ..
```

This creates default users:
- **Admin**: username: `admin`, password: `admin123`
- **Staff**: username: `staff1`, password: `password123`
- **Evaluator**: username: `evaluator1`, password: `password123`

---

## 🚀 Usage

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Start Frontend Development Server
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
npm run build
```

#### Start Production Server
```bash
cd backend
npm start
```

### Access the Application
1. Open browser: `http://localhost:5173`
2. Login with default credentials
3. Navigate through role-specific dashboards

---

## 👤 User Roles

### 🔴 Administrator
**Capabilities:**
- Manage all users (create, update, delete)
- Create and manage positions
- View all applications
- Assign evaluators to positions
- Generate reports and analytics
- Configure system settings
- Access full audit logs

**Dashboard Features:**
- Total users, positions, applications statistics
- Recent activity feed
- System health monitoring
- Quick actions panel

### 🟢 Staff (Applicants)
**Capabilities:**
- Complete profile with education, experience, skills
- Browse available positions
- Submit applications with documents
- Track application status
- Receive notifications
- Update profile information

**Dashboard Features:**
- Profile completeness indicator
- Available positions
- My applications status
- Recent notifications
- Application history

### 🟡 Evaluator
**Capabilities:**
- View assigned positions
- Access submitted applications
- Evaluate candidates with scoring
- Provide feedback and recommendations
- Track evaluation progress
- Submit evaluation reports

**Dashboard Features:**
- Pending evaluations
- Completed evaluations
- Evaluation statistics
- Assigned positions

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
```
POST   /auth/register          - Register new user (Admin only)
POST   /auth/login             - User login
POST   /auth/refresh-token     - Refresh access token
POST   /auth/forgot-password   - Request password reset
POST   /auth/reset-password    - Reset password with token
GET    /auth/me                - Get current user profile
PATCH  /auth/me                - Update user profile
PATCH  /auth/change-password   - Change password
```

### Position Endpoints
```
GET    /positions              - Get all positions
POST   /positions              - Create position (Admin)
GET    /positions/:id          - Get position by ID
PATCH  /positions/:id          - Update position (Admin)
DELETE /positions/:id          - Delete position (Admin)
```

### Application Endpoints
```
GET    /applications           - Get user's applications
POST   /applications           - Submit application
GET    /applications/:id       - Get application details
PATCH  /applications/:id       - Update application status (Admin)
DELETE /applications/:id       - Delete application
```

### User Management Endpoints
```
GET    /auth/users             - Get all users (Admin)
PATCH  /auth/users/:id         - Update user (Admin)
DELETE /auth/users              - Delete users (Admin)
```

For complete API documentation, see [API_REFERENCE.md](backend/API_REFERENCE.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Code Style
- Use **ESLint** for JavaScript linting
- Follow **Airbnb JavaScript Style Guide**
- Write **meaningful commit messages**
- Add **comments** for complex logic
- Write **unit tests** for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### Project Maintainers
- **Abdisa Gezachew** - 
- **Kidus Tadesse** - [@kidustadessek-ai](https://github.com/kidustadessek-ai)

### Support Channels
- **Email**: support@aau-iapams.com
- **Issues**: [GitHub Issues](https://github.com/kidustadessek-ai/AAU-IAPAMS/issues)
- **Documentation**: [Project Wiki](https://github.com/teddymillion/AAU-IAPAMS/wiki)

---

## 🙏 Acknowledgments

- **Addis Ababa University** - For project sponsorship and requirements
- **Open Source Community** - For amazing tools and libraries
- **Contributors** - For their valuable contributions

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0.0-green)

**Current Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Active Development

---

<div align="center">
  <p>Made with ❤️ for Addis Ababa University</p>
  <p>© 2026 AAU-IAPAMS. All rights reserved.</p>
</div>

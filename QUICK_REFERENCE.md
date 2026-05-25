# Quick Reference Guide - AAU-IAPAMS

## 🔐 Environment Setup

### Required Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/aau-iapams

# JWT Secrets (CHANGE THESE!)
JWT_ACCESS_SECRET=your-unique-secret-here
JWT_REFRESH_SECRET=your-unique-refresh-secret-here
JWT_RESET_SECRET=your-unique-reset-secret-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=AAU IAPAMS <noreply@aau.edu.et>

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 📦 Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
npm run build
npm run preview
```

## 🔑 Constants Usage

### Import Constants
```javascript
// Frontend
import { USER_ROLES, ERROR_MESSAGES } from '../constants';

// Backend
import { USER_ROLES, HTTP_STATUS } from '../constants/index.js';
```

### Common Constants
```javascript
// User Roles
USER_ROLES.ADMIN
USER_ROLES.STAFF
USER_ROLES.EVALUATOR

// User Status
USER_STATUS.ACTIVE
USER_STATUS.INACTIVE
USER_STATUS.SUSPENDED

// HTTP Status
HTTP_STATUS.OK                    // 200
HTTP_STATUS.CREATED               // 201
HTTP_STATUS.BAD_REQUEST           // 400
HTTP_STATUS.UNAUTHORIZED          // 401
HTTP_STATUS.FORBIDDEN             // 403
HTTP_STATUS.NOT_FOUND             // 404
HTTP_STATUS.INTERNAL_SERVER_ERROR // 500

// Application Status
APPLICATION_STATUS.PENDING
APPLICATION_STATUS.UNDER_REVIEW
APPLICATION_STATUS.SHORTLISTED
APPLICATION_STATUS.REJECTED
APPLICATION_STATUS.ACCEPTED
```

## 📝 Logging

### Backend Logging
```javascript
import { logger } from '../utils/logger.js';

// Info level
logger.info('User logged in', { userId: user._id });

// Warning level
logger.warn('Rate limit approaching', { ip: req.ip });

// Error level
logger.error('Database error', { error: err.message });

// Debug level
logger.debug('Processing request', { body: req.body });
```

### Log Levels
Set in `.env`:
```bash
LOG_LEVEL=INFO  # ERROR | WARN | INFO | DEBUG
```

## 🔒 Password Requirements

### New Requirements (v2.0)
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Example Valid Passwords
- `MyPass123!`
- `Secure@2024`
- `Admin$Pass1`

## 🗄️ Database Indexes

### User Model Indexes
```javascript
// Single indexes
{ email: 1 }
{ username: 1 }
{ department: 1 }

// Compound index
{ role: 1, status: 1 }
```

## 🛡️ Security Best Practices

### 1. Never Commit Secrets
```bash
# Always in .gitignore
.env
.env.local
.env.production
```

### 2. Use Strong JWT Secrets
```bash
# Generate strong secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Validate Input
```javascript
// Always validate user input
if (!email || !password) {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: ERROR_MESSAGES.VALIDATION_ERROR
  });
}
```

### 4. Use Constants
```javascript
// ❌ Bad
if (user.role === 'admin') { }

// ✅ Good
if (user.role === USER_ROLES.ADMIN) { }
```

## 🐛 Debugging

### Check Environment Variables
```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

### Check Database Connection
```bash
# MongoDB
mongosh
show dbs
use aau-iapams
db.users.find()
```

### Check Logs
```bash
# Backend logs (if using PM2)
pm2 logs

# Or check console output
```

## 📊 Common Commands

### Database
```bash
# Seed database
cd backend
npm run seed

# Drop database
mongosh
use aau-iapams
db.dropDatabase()
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run specific test
npm test -- user.test.js
```

### Build
```bash
# Frontend build
npm run build

# Check build size
npm run build -- --report
```

## 🔧 Troubleshooting

### Issue: Server won't start
**Solution**: Check environment variables
```bash
cd backend
node src/utils/validateEnv.js
```

### Issue: MongoDB connection failed
**Solution**: 
1. Check MongoDB is running: `mongosh`
2. Check MONGODB_URI in .env
3. Check network connectivity

### Issue: CORS errors
**Solution**: Check FRONTEND_URL in backend .env matches your frontend URL

### Issue: JWT errors
**Solution**: 
1. Check JWT secrets are set
2. Clear localStorage in browser
3. Login again

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

## 🆘 Getting Help

1. Check this guide first
2. Check `CRITICAL_FIXES_STEP1_COMPLETE.md`
3. Check error logs
4. Search existing issues
5. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Logs

---

**Last Updated**: Step 1 Critical Fixes Complete

# Quick Start Guide

Get the AAU IAPAMS Backend API up and running in 5 minutes!

## ⚡ Prerequisites

Make sure you have these installed:
- **Node.js** (v16+): [Download here](https://nodejs.org/)
- **MongoDB**: [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free)
- **Git**: [Download here](https://git-scm.com/)

## 🚀 Installation Steps

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages (~2 minutes).

### Step 3: Setup Environment Variables

Copy the example environment file:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `.env` and update these **REQUIRED** fields:

```env
# Database - Use one of these options:

# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/aau-iapams

# Option B: MongoDB Atlas (Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aau-iapams

# JWT Secrets - Generate strong random strings
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_RESET_SECRET=your-super-secret-reset-key-change-this

# Cloudinary (for file uploads) - Get free account at cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset) - Use Gmail with App Password
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**💡 Quick Tips:**
- For JWT secrets, use random strings (at least 32 characters)
- For Cloudinary, sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
- For Gmail, enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833)

### Step 4: Seed the Database

Populate the database with sample data:
```bash
npm run seed
```

This creates:
- 1 Admin account
- 2 Evaluator accounts
- 3 Staff accounts
- 3 Sample positions
- 3 Sample applications

**Default Login Credentials:**
```
Admin:
  Username: admin
  Password: Admin@123

Evaluator:
  Username: evaluator1
  Password: Evaluator@123

Staff:
  Username: staff1
  Password: Staff@123
```

### Step 5: Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 AAU IAPAMS API Server                                ║
║                                                           ║
║   Environment: development                                ║
║   Port: 5000                                              ║
║   URL: http://localhost:5000                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## ✅ Verify Installation

### Test 1: Health Check
Open your browser and visit:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "AAU IAPAMS API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test 2: Login
Use Postman, Thunder Client, or curl:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

You should get a response with access token.

### Test 3: Get Positions
```bash
curl http://localhost:5000/api/v1/positions
```

You should see the 3 seeded positions.

## 🎯 Next Steps

### 1. Import Postman Collection
- Open Postman
- Import `AAU-IAPAMS.postman_collection.json`
- Test all endpoints

### 2. Connect Frontend
Update frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Explore API Documentation
Read `README.md` for complete API documentation.

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection failed
```

**Solutions:**
- **Local MongoDB**: Make sure MongoDB service is running
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```
- **MongoDB Atlas**: Check your connection string and network access settings

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Change port in `.env`:
```env
PORT=5001
```

### Cloudinary Upload Error
```
❌ File upload failed
```

**Solution:** Verify Cloudinary credentials in `.env`

### Email Send Error
```
❌ Email send error
```

**Solution:** 
- Verify Gmail credentials
- Make sure you're using an App Password, not your regular password
- Check if 2FA is enabled on your Google account

### Module Not Found
```
Error: Cannot find module 'express'
```

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

## 📚 Useful Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Check for outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit
```

## 🔑 Test Accounts

After seeding, use these accounts for testing:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | Admin@123 | Full system access |
| Evaluator | evaluator1 | Evaluator@123 | Can evaluate applications |
| Evaluator | evaluator2 | Evaluator@123 | Can evaluate applications |
| Staff | staff1 | Staff@123 | Can apply for positions |
| Staff | staff2 | Staff@123 | Can apply for positions |
| Staff | staff3 | Staff@123 | Can apply for positions |

## 🎓 Learning Resources

- **Express.js**: [expressjs.com](https://expressjs.com/)
- **MongoDB**: [mongodb.com/docs](https://www.mongodb.com/docs/)
- **Mongoose**: [mongoosejs.com](https://mongoosejs.com/)
- **JWT**: [jwt.io](https://jwt.io/)
- **Cloudinary**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

## 💡 Pro Tips

1. **Use Nodemon**: Already configured with `npm run dev` for auto-reload
2. **Use Postman**: Import the collection for easy API testing
3. **Check Logs**: Watch the console for helpful debug information
4. **MongoDB Compass**: Use [MongoDB Compass](https://www.mongodb.com/products/compass) to visualize your data
5. **VS Code Extensions**: Install REST Client or Thunder Client for testing APIs

## 🆘 Need Help?

1. Check the main `README.md` for detailed documentation
2. Review `DEPLOYMENT.md` for production setup
3. Check the console logs for error messages
4. Verify all environment variables are set correctly

## 🎉 Success!

If you can:
- ✅ See the server running message
- ✅ Access the health check endpoint
- ✅ Login with test credentials
- ✅ Get positions list

**Congratulations! Your backend is ready!** 🚀

Now you can:
- Connect your frontend
- Test all API endpoints
- Start developing new features
- Deploy to production

Happy coding! 💻

# 🚀 Quick Fix Guide - AAU-IAPAMS

## 🔴 Problems You're Experiencing
1. Backend crashes: "Port 5000 already in use"
2. Profile photos not showing
3. "No data found" errors
4. Timeout errors

## ✅ Solution (3 Simple Steps)

### Step 1: Run the Fix Script
Double-click `fix-and-start.bat` in the project root folder.

This will:
- Kill any process using port 5000
- Start the backend server
- Start the frontend server
- Open your browser automatically

### Step 2: Wait for Servers to Start
- Backend will start on: http://localhost:5000
- Frontend will start on: http://localhost:5173
- Wait about 10-15 seconds for both to fully initialize

### Step 3: Login and Test
1. Login with your credentials
2. Navigate to "Manage Users"
3. Profile photos should now display

## 🔧 Manual Fix (If Script Doesn't Work)

### Fix Port 5000 Conflict
```bash
# Open Command Prompt as Administrator
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace 1234 with actual PID)
taskkill /PID 1234 /F
```

### Start Backend
```bash
cd backend
npm install
npm run dev
```

### Start Frontend (New Terminal)
```bash
cd c:\Users\Tedros Milion\AAU-IAPAMS
npm install
npm run dev
```

## 📋 Diagnostic Tool

Run `check-system.bat` to diagnose issues:
- Checks if ports are available
- Verifies all files exist
- Shows environment configuration

## 🖼️ About Profile Photos

Profile photos are stored in Cloudinary and will display automatically once:
1. Backend is running
2. MongoDB is connected
3. Users have uploaded photos

If you see initials instead of photos, it means:
- User hasn't uploaded a photo yet (this is normal)
- Backend is not running
- Cloudinary credentials are incorrect

## 🔑 Environment Variables

### Backend (.env) - Already Fixed ✅
```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:admin@ac-9oq1fdx.veoknf0.mongodb.net/aau-iapams?retryWrites=true&w=majority&appName=AAU-IAPAMS
CLOUDINARY_CLOUD_NAME=djcozsyau
CLOUDINARY_API_KEY=168729792643389
CLOUDINARY_API_SECRET=GV2Ba2cLYNZYX5PDAbDwwQze7h0
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env) - Already Configured ✅
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## ❓ Common Issues

### "Port 5000 still in use"
- Run `fix-and-start.bat` again
- Or manually kill the process using Task Manager

### "Cannot connect to MongoDB"
- Check your internet connection
- Verify MongoDB Atlas credentials
- Ensure your IP is whitelisted in MongoDB Atlas

### "Network Error" in browser
- Backend is not running
- Check backend terminal for errors
- Verify VITE_API_BASE_URL in frontend .env

### Profile photos show placeholders
- This is normal if no photo is uploaded
- Upload a photo in Profile Settings to test

## 🎯 Testing Profile Photos

1. Login as admin
2. Go to your profile (click avatar in top right)
3. Click "Edit Profile"
4. Upload a profile photo
5. Save
6. Check "Manage Users" page - your photo should appear

## 📞 Still Having Issues?

1. Run `check-system.bat` and share the output
2. Check backend terminal for error messages
3. Check browser console (F12) for errors
4. Verify MongoDB connection in backend logs

## 🎉 Success Indicators

✅ Backend shows: "AAU IAPAMS API Server" banner
✅ Backend shows: "MongoDB Connected"
✅ Frontend opens at http://localhost:5173
✅ Login page loads without errors
✅ Dashboard shows data after login
✅ Manage Users page shows user list
✅ Profile photos display (or initials if no photo)

---

**Last Updated:** $(Get-Date)
**Status:** All fixes applied ✅

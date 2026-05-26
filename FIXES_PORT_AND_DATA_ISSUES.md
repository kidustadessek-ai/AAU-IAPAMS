# Fix Guide: Port Conflicts, Profile Photos, and Data Loading Issues

## Problem Summary
1. Backend crashes with "Port 5000 already in use"
2. Profile photos not displaying in Manage Users, Application Management, and Evaluation Management
3. Pages show "No data found" and timeout errors

## Solutions

### 1. Fix Port 5000 Conflict

#### Option A: Kill the process using port 5000 (Recommended)
```bash
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID from above)
taskkill /PID <PID> /F
```

#### Option B: Change the backend port
Edit `backend\.env` and change:
```env
PORT=5001
```

Then update `frontend\.env`:
```env
VITE_API_URL=http://localhost:5001/api/v1
```

### 2. Fix MongoDB Connection Issues

Your MongoDB URI in `backend\.env` appears incomplete. Update it to:
```env
MONGODB_URI=mongodb+srv://admin:admin@ac-9oq1fdx.veoknf0.mongodb.net/aau-iapams?retryWrites=true&w=majority
```

**Note:** Replace `admin:admin` with your actual MongoDB credentials if different.

### 3. Profile Photos Already Working

The code is correctly configured to display profile photos. The issue is that:
- Backend is not running (port conflict)
- Data is not loading (MongoDB connection issue)

Once you fix issues #1 and #2, profile photos will display automatically.

## Step-by-Step Startup Process

### Step 1: Clean Start Backend
```bash
# Navigate to backend folder
cd backend

# Kill any process on port 5000
netstat -ano | findstr :5000
# If found, run: taskkill /PID <PID> /F

# Install dependencies (if needed)
npm install

# Start backend
npm run dev
```

### Step 2: Start Frontend
```bash
# Open a new terminal
# Navigate to project root
cd c:\Users\Tedros Milion\AAU-IAPAMS

# Install dependencies (if needed)
npm install

# Start frontend
npm run dev
```

## Verification Checklist

✅ Backend starts without port errors
✅ Backend shows: "AAU IAPAMS API Server" banner
✅ Backend connects to MongoDB successfully
✅ Frontend starts on port 5173
✅ Login page loads
✅ After login, dashboard loads data
✅ Manage Users page shows user list
✅ Profile photos display (if users have uploaded photos)

## Common Issues and Solutions

### Issue: "EADDRINUSE: address already in use :::5000"
**Solution:** Kill the process using port 5000 or change the port

### Issue: "MongooseServerSelectionError"
**Solution:** Check your MongoDB URI and internet connection

### Issue: "Network Error" or "timeout" in frontend
**Solution:** Ensure backend is running and VITE_API_URL is correct

### Issue: Profile photos show placeholder initials
**Solution:** This is normal if users haven't uploaded photos yet. Upload a photo in user profile to test.

## Testing Profile Photo Upload

1. Login as admin
2. Go to Profile Settings
3. Click "Edit Profile"
4. Upload a profile photo
5. Save changes
6. Check if photo appears in:
   - Profile dropdown
   - Manage Users page
   - Application Management (if you're an applicant)

## Environment Variables Check

### Backend `.env` should have:
```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:admin@ac-9oq1fdx.veoknf0.mongodb.net/aau-iapams?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=djcozsyau
CLOUDINARY_API_KEY=168729792643389
CLOUDINARY_API_SECRET=GV2Ba2cLYNZYX5PDAbDwwQze7h0
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` should have:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Quick Fix Script

Save this as `fix-and-start.bat` in project root:
```batch
@echo off
echo Fixing AAU-IAPAMS startup issues...
echo.

echo Step 1: Killing process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul
echo Done.
echo.

echo Step 2: Starting backend...
cd backend
start cmd /k "npm run dev"
timeout /t 5
cd ..
echo.

echo Step 3: Starting frontend...
start cmd /k "npm run dev"
echo.

echo Both servers should be starting now!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
```

Run it with: `fix-and-start.bat`

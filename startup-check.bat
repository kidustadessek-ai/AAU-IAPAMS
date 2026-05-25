@echo off
echo ========================================
echo AAU-IAPAMS Startup Verification
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js
    exit /b 1
)
echo ✅ Node.js installed

echo.
echo [2/4] Checking backend environment...
cd backend
if not exist .env (
    echo ❌ Backend .env file not found
    echo Please copy .env.example to .env and configure it
    exit /b 1
)
echo ✅ Backend .env exists

echo.
echo [3/4] Testing environment validation...
node test-env.js
if %errorlevel% neq 0 (
    echo ❌ Environment validation failed
    exit /b 1
)

echo.
echo [4/4] Checking frontend environment...
cd ..
if not exist .env (
    echo ⚠️  Frontend .env not found (optional)
    echo Default API URL will be used: http://localhost:5000/api/v1
) else (
    echo ✅ Frontend .env exists
)

echo.
echo ========================================
echo ✅ All checks passed!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Start Backend:
echo    cd backend
echo    npm start
echo.
echo 2. Start Frontend (in new terminal):
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:5173
echo.
pause

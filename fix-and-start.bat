@echo off
echo ========================================
echo AAU-IAPAMS Startup Fix Script
echo ========================================
echo.

echo [1/4] Checking for processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found process %%a using port 5000. Killing it...
    taskkill /PID %%a /F 2>nul
)
echo Port 5000 is now free.
echo.

echo [2/4] Starting Backend Server...
cd backend
start "AAU-IAPAMS Backend" cmd /k "echo Starting backend on port 5000... && npm run dev"
cd ..
echo Waiting for backend to initialize...
timeout /t 8 /nobreak >nul
echo.

echo [3/4] Starting Frontend Server...
start "AAU-IAPAMS Frontend" cmd /k "echo Starting frontend on port 5173... && npm run dev"
echo Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul
echo.

echo [4/4] Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.

echo ========================================
echo Startup Complete!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul

@echo off
echo ========================================
echo AAU-IAPAMS System Diagnostics
echo ========================================
echo.

echo [Checking Port 5000]
netstat -ano | findstr :5000 | findstr LISTENING
if %errorlevel% equ 0 (
    echo WARNING: Port 5000 is in use!
    echo Run fix-and-start.bat to resolve this.
) else (
    echo OK: Port 5000 is available
)
echo.

echo [Checking Port 5173]
netstat -ano | findstr :5173 | findstr LISTENING
if %errorlevel% equ 0 (
    echo OK: Frontend is running on port 5173
) else (
    echo INFO: Frontend is not running
)
echo.

echo [Checking Backend Files]
if exist "backend\server.js" (
    echo OK: Backend server.js found
) else (
    echo ERROR: Backend server.js not found!
)
if exist "backend\.env" (
    echo OK: Backend .env found
) else (
    echo ERROR: Backend .env not found!
)
if exist "backend\node_modules" (
    echo OK: Backend dependencies installed
) else (
    echo WARNING: Backend dependencies not installed. Run: cd backend && npm install
)
echo.

echo [Checking Frontend Files]
if exist "node_modules" (
    echo OK: Frontend dependencies installed
) else (
    echo WARNING: Frontend dependencies not installed. Run: npm install
)
if exist ".env" (
    echo OK: Frontend .env found
) else (
    echo ERROR: Frontend .env not found!
)
echo.

echo [Environment Configuration]
echo Backend .env:
type backend\.env | findstr "PORT="
type backend\.env | findstr "MONGODB_URI=" | findstr /v "MONGODB_URI=mongodb"
echo (MongoDB URI hidden for security)
echo.
echo Frontend .env:
type .env
echo.

echo ========================================
echo Diagnostics Complete
echo ========================================
echo.
echo To start the system, run: fix-and-start.bat
echo.
pause

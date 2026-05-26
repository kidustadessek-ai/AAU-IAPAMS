@echo off
echo Killing process on port 5000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found process %%a using port 5000
    taskkill /PID %%a /F
    if %errorlevel% equ 0 (
        echo Successfully killed process %%a
    ) else (
        echo Failed to kill process %%a. Try running as Administrator.
    )
)

echo.
echo Port 5000 should now be free.
echo You can now start the backend with: cd backend && npm run dev
echo.
pause

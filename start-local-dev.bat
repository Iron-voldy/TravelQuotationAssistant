@echo off
REM Quick Start - Run This to Get Started!

echo.
echo 🚀 Travel Quotation Assistant - Local Development
echo ================================================== 
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Check if setupProxy.js exists
if not exist "src\setupProxy.js" (
    echo ⚠️  Warning: src\setupProxy.js not found
)

REM Show important info
echo 📋 Configuration:
echo    - Development Proxy: http://localhost:3000/api -^> https://stagev2.appletechlabs.com/api
echo    - Login: http://localhost:3000/login
echo    - Register: http://localhost:3000/register
echo.

REM Start the app
echo 🎬 Starting development server...
echo.
echo To access from another machine:
echo    set HOST=0.0.0.0
echo    npm start
echo    Then visit: http://YOUR_IP:3000
echo.
echo.

call npm start

pause

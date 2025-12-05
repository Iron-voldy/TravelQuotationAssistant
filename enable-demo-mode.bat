@echo off
echo.
echo ========================================
echo   Enabling DEMO MODE
echo ========================================
echo.

cd src\services

if not exist api.backup.js (
    echo Creating backup of real API...
    copy api.js api.backup.js
    echo Backup created: api.backup.js
) else (
    echo Backup already exists: api.backup.js
)

echo.
echo Switching to demo mode...
copy /Y api.demo.js api.js

echo.
echo ========================================
echo   DEMO MODE ENABLED!
echo ========================================
echo.
echo Demo Login Credentials:
echo   Email: demo@example.com
echo   Password: Demo1234
echo.
echo You can also register with any email/password
echo.
echo To switch back to real API, run:
echo   disable-demo-mode.bat
echo.
echo Now restart your app:
echo   npm start
echo.
pause

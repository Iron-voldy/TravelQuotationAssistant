@echo off
echo.
echo ========================================
echo   Disabling DEMO MODE
echo ========================================
echo.

cd src\services

if exist api.backup.js (
    echo Restoring real API from backup...
    copy /Y api.backup.js api.js
    echo.
    echo ========================================
    echo   REAL API RESTORED!
    echo ========================================
    echo.
    echo You are now using the real backend API:
    echo   https://stagev2.appletechlabs.com/api
    echo.
    echo Make sure backend CORS is enabled!
    echo.
) else (
    echo ERROR: Backup file not found!
    echo Cannot restore real API.
    echo.
)

echo Now restart your app:
echo   npm start
echo.
pause

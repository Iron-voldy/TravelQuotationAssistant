@echo off
echo ========================================
echo Starting CORS Proxy
echo ========================================
echo.
echo This proxy allows your browser to connect to the backend API
echo by adding CORS headers to the responses.
echo.
echo Backend: https://stagev2.appletechlabs.com
echo Proxy: http://localhost:8010
echo.
echo KEEP THIS WINDOW OPEN while using the app!
echo Press Ctrl+C to stop the proxy.
echo.
echo ========================================
echo.

lcp --proxyUrl https://stagev2.appletechlabs.com --port 8011

# How to Run the Application

## The CORS Issue

Your backend API works perfectly in Postman but not in the browser because:
- The backend server at `https://stagev2.appletechlabs.com` doesn't send CORS headers
- Browsers enforce CORS security (Postman doesn't)
- This blocks the browser from connecting

## Solution: CORS Proxy

I've set up a local CORS proxy that adds CORS headers to the backend responses.

## Steps to Run

### 1. Start the CORS Proxy (REQUIRED)

**Open a NEW terminal/command prompt** and run:

```bash
cd C:\Users\LapMart\Downloads\Travel_Quotation_Assistant
start-cors-proxy.bat
```

Or simply double-click `start-cors-proxy.bat`

**KEEP THIS WINDOW OPEN!** The proxy must run while you use the app.

You should see:
```
Proxy Active
Proxy running on port 8011
```

### 2. Start the React App

**Open ANOTHER terminal** and run:

```bash
cd C:\Users\LapMart\Downloads\Travel_Quotation_Assistant
npm start
```

The app will open at `http://localhost:3000`

### 3. Register or Login

Now you can:
- Register with any email and password
- Login with existing credentials

The app will connect to the real backend through the CORS proxy!

## How It Works

```
Browser → CORS Proxy (localhost:8011) → Backend API
          [Adds CORS headers]         (stagev2.appletechlabs.com)
```

The proxy forwards all requests to the real backend and adds CORS headers to the responses, allowing the browser to accept them.

## Troubleshooting

### Error: "Cannot connect to server"

1. Check that `start-cors-proxy.bat` is running
2. You should see "Proxy Active" in that terminal
3. Restart both the proxy and the app

### Proxy not starting

Run this command manually:
```bash
lcp --proxyUrl https://stagev2.appletechlabs.com --port 8011
```

If it says "command not found", reinstall:
```bash
npm install -g local-cors-proxy
```

### Want to use direct backend?

If your backend team enables CORS, you can switch back by editing `src/services/api.js`:

Change line 3 from:
```javascript
const API_BASE_URL = 'http://localhost:8011/proxy/api';
```

Back to:
```javascript
const API_BASE_URL = 'https://stagev2.appletechlabs.com/api';
```

## Summary

1. Run `start-cors-proxy.bat` (keep it open)
2. Run `npm start` in another terminal
3. Use the app normally

The backend works correctly - it just needs CORS headers for browser access!

# Local Development Setup - CORS Proxy Solution

## Problem
The React app running on `http://localhost:3000` or `http://192.168.x.x:3000` cannot directly connect to `https://stagev2.appletechlabs.com/api` due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution
The app now uses **setupProxy.js** - a development proxy built into Create React App that automatically forwards API calls to the backend while bypassing CORS issues.

## How It Works

1. **Local Requests**: Your app makes requests to `/api/*`
2. **Proxy Intercepts**: setupProxy.js intercepts these requests
3. **Forwards to Backend**: Requests are forwarded to `https://stagev2.appletechlabs.com/api/*`
4. **Response Returned**: The response is sent back to your app
5. **Result**: CORS is bypassed! ✅

## Setup Steps

### Step 1: Install Dependencies
```bash
npm install
```

This will install `http-proxy-middleware` which is required for setupProxy.js to work.

### Step 2: Start the Development Server
```bash
npm start
```

The app will automatically use the development proxy for API calls.

### Step 3: Test the Connection
1. Open `http://localhost:3000/login`
2. Try logging in with any credentials
3. Check browser console (F12) for logs

You should see in console:
```
[API CONFIG] Base URL: /api
[API] Using local development proxy via setupProxy.js
[LOGIN] Attempting login with: { email: '...' }
```

## How to Access from Other Machines

If you want to access the app from another machine on your network (e.g., `http://192.16.26.167:3000`):

### Option 1: Start with Network Hostname
```bash
npm start -- --host 0.0.0.0
```

Or set environment variable:
```bash
set HOST=0.0.0.0
npm start
```

Then access from other machine:
```
http://192.16.26.167:3000
```

The proxy will still work because setupProxy.js runs on the development server.

### Option 2: PowerShell Command
```powershell
$env:HOST="0.0.0.0"; npm start
```

## Troubleshooting

### Issue: Still getting "Cannot connect to server" error

**Check 1**: Verify setupProxy.js exists
```bash
ls src/setupProxy.js
```

**Check 2**: Verify http-proxy-middleware is installed
```bash
npm list http-proxy-middleware
```

**Check 3**: Clear cache and restart
```bash
npm cache clean --force
Remove-Item -Path "./.eslintcache", "node_modules/.cache" -Force -Recurse -ErrorAction SilentlyContinue
npm start
```

**Check 4**: Check browser console
- Open DevTools (F12)
- Check Console tab for proxy logs
- Look for `[API CONFIG]` messages

### Issue: Proxy is slow or timing out

This can happen if the backend is under load. Try:
1. Check if `https://stagev2.appletechlabs.com/api` is accessible in browser
2. Wait a moment and try again
3. Check your internet connection

### Issue: ENOENT error about setupProxy.js

**Solution**: Reinstall dependencies
```bash
rm -r node_modules
npm install
npm start
```

## What setupProxy.js Does

The file `src/setupProxy.js` automatically runs when you start the development server and:

1. Intercepts all requests to `/api/*`
2. Changes the origin (removes CORS restrictions)
3. Forwards to `https://stagev2.appletechlabs.com`
4. Returns the response to your app

This is a built-in Create React App feature - no extra tools needed!

## Environment Variables

You can override the default behavior with environment variables:

```bash
# Use custom backend (if you have your own local backend)
set REACT_APP_API_URL=http://localhost:5000/api
npm start

# Use direct HTTPS connection (if backend CORS allows)
set REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
npm start
```

## Production Deployment

When you build for production (`npm run build`):
- setupProxy.js is **NOT** included
- The app uses direct HTTPS connections
- Make sure to set `REACT_APP_API_URL` environment variable in your deployment platform (Vercel, Netlify, etc.)

## API Endpoints Available

The proxy forwards all requests to:
```
/api/* -> https://stagev2.appletechlabs.com/api/*
```

So these endpoints work:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/quotation/list`
- `POST /api/booking/save`
- And all other API endpoints!

## Access from Network

To access from your IP address `192.16.26.167`:

```powershell
# Terminal 1: Start the development server on all interfaces
set HOST=0.0.0.0
npm start
```

Then from any machine on the network:
```
http://192.16.26.167:3000
```

The proxy will automatically work because it's running on the Node.js development server!

## Files Modified/Created

- ✅ `src/setupProxy.js` - Development proxy configuration (NEW)
- ✅ `src/services/api.js` - Updated to use /api routes in development
- ✅ `package.json` - Added http-proxy-middleware dependency
- ✅ `.env.local` - Updated with configuration options

## Next Steps

1. Run `npm install` to install dependencies
2. Run `npm start` to start the development server
3. Open `http://localhost:3000` or `http://192.16.26.167:3000`
4. Test login functionality
5. Check console for API logs

## Need Help?

1. Check browser console (F12) for error messages
2. Check Node.js console for [API] logs
3. Verify internet connection
4. Try clearing cache: `npm cache clean --force`
5. Verify backend is online: `https://stagev2.appletechlabs.com/api`

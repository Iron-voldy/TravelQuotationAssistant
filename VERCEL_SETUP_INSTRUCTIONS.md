# Vercel Deployment Setup Instructions

## Problem
Backend server (https://stagev2.appletechlabs.com/api) does NOT have CORS enabled, causing CORS policy errors when accessing from Vercel.

## Solution
Use Vercel serverless proxy (/api/proxy.js) to bypass CORS restrictions.

## REQUIRED: Manual Setup in Vercel Dashboard

Since `.env.production` may not be read correctly by Vercel, you MUST set the environment variable manually in Vercel dashboard:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Find your project: `travel-quotation-assistants` (or whatever it's named)
3. Click on the project

### Step 2: Add Environment Variable
1. Click "Settings" tab
2. Click "Environment Variables" in the left sidebar
3. Add a NEW environment variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `/api/proxy?path=`
   - **Environment**: Check ALL boxes (Production, Preview, Development)
4. Click "Save"

### Step 3: Redeploy
1. Go to "Deployments" tab
2. Find the latest deployment
3. Click the "..." menu button
4. Click "Redeploy"
5. Confirm redeploy

### Step 4: Wait 2-3 Minutes
Vercel will rebuild your app with the new environment variable.

### Step 5: Clear Cache and Test
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Or test in Incognito/Private mode
3. Try logging in at: https://travel-quotation-assistants.vercel.app/login

## Expected Behavior After Fix

### In Browser Console (F12), you should see:
```
[API] Using custom API URL: /api/proxy?path=
```

### NOT this (old behavior):
```
[API] Using production backend: https://stagev2.appletechlabs.com/api
```

## Verify Proxy is Working

Test the proxy endpoint directly by visiting:
```
https://travel-quotation-assistants.vercel.app/api/proxy?path=/auth/login
```

You should see either:
- A JSON error response (this is good! The proxy is working)
- NOT the React app HTML page

## Troubleshooting

### If you still see CORS errors after redeployment:
1. Check Vercel deployment logs for errors
2. Verify the environment variable is set correctly in dashboard
3. Make sure you redeployed AFTER adding the environment variable
4. Clear browser cache completely (or use Incognito mode)
5. Check that the deployed JS file has changed (different filename)

### If /api/proxy returns HTML instead of JSON:
The serverless function isn't deploying. Check Vercel build logs for errors.

## Files Involved

- `/api/proxy.js` - Serverless function that proxies requests to backend
- `.env.production` - Contains REACT_APP_API_URL=/api/proxy?path=
- `vercel.json` - Routing configuration
- `src/services/api.js` - Frontend API configuration

## How the Proxy Works

```
Frontend (/login page)
    ↓
    POST to /api/proxy?path=/auth/login
    ↓
Vercel Serverless Function (/api/proxy.js)
    ↓
    Adds CORS headers
    ↓
    POST to https://stagev2.appletechlabs.com/api/auth/login
    ↓
Backend Server (no CORS)
    ↓
    Response
    ↓
Serverless Function (adds CORS headers to response)
    ↓
Frontend receives response (NO CORS ERROR!)
```

## Alternative: If Serverless Proxy Doesn't Work

If the serverless function continues to fail, you can ask the backend team to enable CORS by adding these headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
```

Then change `REACT_APP_API_URL` back to:
```
https://stagev2.appletechlabs.com/api
```

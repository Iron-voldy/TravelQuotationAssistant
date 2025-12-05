# Troubleshooting Guide

## "Failed to fetch" Error During Registration/Login

### Problem
You see this error:
```
TypeError: Failed to fetch
```

### Root Cause
This is a **CORS (Cross-Origin Resource Sharing)** issue. The backend server at `https://stagev2.appletechlabs.com` needs to allow requests from your development server (`http://localhost:3000`).

### Solutions

#### Option 1: Enable CORS on Backend (Recommended)
The backend server needs to include these headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Credentials: true
```

**For Laravel/PHP Backend:**
```php
// In app/Http/Middleware/Cors.php or similar
return $next($request)
    ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    ->header('Access-Control-Allow-Credentials', 'true');
```

#### Option 2: Use a CORS Proxy (Development Only)
Install and use a local CORS proxy:

```bash
npm install -g local-cors-proxy
```

Then run:
```bash
lcp --proxyUrl https://stagev2.appletechlabs.com --port 8010
```

Then update `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8010/api';
```

#### Option 3: Use Browser Extension (Development Only)
Install a CORS browser extension:
- Chrome: "Allow CORS: Access-Control-Allow-Origin"
- Firefox: "CORS Everywhere"

**Warning**: Only use for testing. Disable after testing.

#### Option 4: Use Demo Mode
I've created a demo mode that simulates API responses. See below.

---

## Demo Mode (For Frontend Testing)

If you want to test the frontend without the backend API, you can enable demo mode.

### Enable Demo Mode

1. **Open** `src/services/api.js`

2. **Add this at the top** (after imports):
```javascript
// Demo Mode Configuration
const DEMO_MODE = true; // Set to false to use real API

// Demo responses
const demoResponses = {
  login: {
    access_token: "demo_token_123456789",
    token_type: "bearer",
    expires_in: 3600,
    user: {
      id: 1,
      name: "Demo User",
      email: "demo@example.com"
    }
  },
  register: {
    access_token: "demo_token_123456789",
    token_type: "bearer",
    expires_in: 3600,
    user: {
      id: 1,
      name: "Demo User",
      email: "demo@example.com"
    }
  }
};
```

3. **Update login function**:
```javascript
login: async (email, password) => {
  // Demo mode
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    if (email === "demo@example.com" && password === "Demo1234") {
      return demoResponses.login;
    }
    throw new Error("Invalid demo credentials. Use: demo@example.com / Demo1234");
  }

  // Real API code below...
  const formData = new FormData();
  // ... rest of the code
},
```

4. **Update register function**:
```javascript
register: async (name, email, password, passwordConfirmation) => {
  // Demo mode
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    return {
      ...demoResponses.register,
      user: { ...demoResponses.register.user, name, email }
    };
  }

  // Real API code below...
  const formData = new FormData();
  // ... rest of the code
},
```

### Using Demo Mode

**Login:**
- Email: `demo@example.com`
- Password: `Demo1234`

**Register:**
- Use any name, email, and valid password
- Will auto-login after registration

---

## Other Common Errors

### Error: "No authentication token received"

**Cause**: API response doesn't include `access_token`

**Check**:
1. Open browser DevTools → Network tab
2. Find the login/register request
3. Check the response
4. Verify it has `access_token` field

**Fix**: Update `LoginPage.jsx` and `RegisterPage.jsx` to match your API response structure:
```javascript
// If your API returns token in different field
const authToken = response.token || response.access_token || response.jwt;
```

---

### Error: 401 Unauthorized on Protected Routes

**Cause**: Bearer token not being sent or is invalid

**Check**:
1. Open DevTools → Application → Local Storage
2. Verify `authToken` exists
3. Check its value isn't "null" or "undefined"

**Fix**:
```javascript
// Clear and re-login
localStorage.clear();
location.reload();
```

---

### Error: Network Request Failed

**Possible Causes**:
1. Backend server is down
2. Wrong API URL
3. Firewall blocking requests
4. No internet connection

**Check**:
1. Test API directly in Postman
2. Verify API URL: `https://stagev2.appletechlabs.com/api`
3. Check backend server logs

---

### Error: Can't read property 'map' of undefined

**Cause**: Chat messages not loading properly

**Fix**:
```javascript
// In TravelQuotationPage.jsx, use optional chaining
{currentChat?.messages?.map((msg, index) => (
  // ... message rendering
))}
```

---

## Testing Without Backend

### 1. Quick Test with Postman
Use the provided Postman collection to test API endpoints directly:
```
Apple Holidays APIs Stage.postman_collection (2).json
```

### 2. Mock Backend with JSON Server
Install json-server:
```bash
npm install -g json-server
```

Create `db.json`:
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "password": "Test1234"
    }
  ]
}
```

Run:
```bash
json-server --watch db.json --port 3001
```

Update API URL:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

---

## Debugging Steps

### 1. Check Browser Console
Press F12 → Console tab
Look for errors in red

### 2. Check Network Tab
Press F12 → Network tab
- Look for failed requests (red)
- Check request headers
- Check response data

### 3. Check LocalStorage
Press F12 → Application → Local Storage
- Verify `authToken` exists
- Check `travel_chats` data

### 4. Enable Verbose Logging
Add to `src/services/api.js`:
```javascript
console.log('API Request:', {
  url: `${API_BASE_URL}/auth/register`,
  method: 'POST',
  body: Object.fromEntries(formData)
});
```

---

## Backend Requirements

For the app to work, the backend must:

1. **Accept CORS requests** from `http://localhost:3000`
2. **Support FormData** for login/register
3. **Return JWT token** in response as `access_token`
4. **Accept Bearer token** in Authorization header
5. **Return proper error messages** in JSON format

### Expected API Responses

**Login/Register Success:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Login/Register Error:**
```json
{
  "message": "Invalid credentials",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## Contact Backend Team

If you continue having issues, contact the backend team and ask them to:

1. Enable CORS for `http://localhost:3000`
2. Verify API endpoints are accessible
3. Check server logs for errors
4. Confirm FormData is being parsed correctly
5. Verify JWT token generation is working

---

## Quick Fix Commands

### Clear Everything and Start Fresh
```bash
# Stop the app (Ctrl+C)
# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Start fresh
npm start
```

### Reset Application State
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test API Directly
```bash
# Using curl
curl -X POST https://stagev2.appletechlabs.com/api/auth/login \
  -F "email=john@example.com" \
  -F "password=secret1"
```

---

## Still Not Working?

1. Check this file: `src/services/api.js` line 1
2. Verify `API_BASE_URL` is correct
3. Try the demo mode option above
4. Test with Postman first
5. Contact backend team about CORS

# Quick Fix for "Failed to fetch" Error

## The Problem
Getting `TypeError: Failed to fetch` when trying to register/login.

## Root Cause
**CORS (Cross-Origin Resource Sharing)** - The backend at `https://stagev2.appletechlabs.com` doesn't allow requests from `http://localhost:3000`.

---

## Solution 1: Enable Demo Mode (Test Frontend Immediately)

### Quick Steps:

1. **Backup current API file:**
   ```bash
   # In your project folder
   cd src/services
   copy api.js api.backup.js
   ```

2. **Replace with demo version:**
   ```bash
   copy api.demo.js api.js
   ```

3. **Restart your app:**
   ```bash
   npm start
   ```

4. **Test with demo credentials:**
   - **Login**: `demo@example.com` / `Demo1234`
   - **Register**: Use any email and password (format: Password123)

### To Switch Back to Real API:
```bash
cd src/services
copy api.backup.js api.js
npm start
```

---

## Solution 2: Use CORS Proxy (Quick Development Fix)

### Install Local CORS Proxy:
```bash
npm install -g local-cors-proxy
```

### Run Proxy:
```bash
lcp --proxyUrl https://stagev2.appletechlabs.com --port 8010
```

### Update API URL:
Open `src/services/api.js` and change line 2:
```javascript
// FROM:
const API_BASE_URL = 'https://stagev2.appletechlabs.com/api';

// TO:
const API_BASE_URL = 'http://localhost:8010/api';
```

### Restart App:
```bash
npm start
```

---

## Solution 3: Contact Backend Team (Permanent Fix)

Ask the backend team to add these CORS headers:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Credentials: true
```

**For Laravel/PHP:**
```php
// In CORS middleware
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Credentials: true');
```

---

## Solution 4: Browser Extension (Development Only)

⚠️ **Warning**: Security risk - only use for testing!

### Chrome:
1. Install: [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore)
2. Click extension icon to enable
3. Refresh your app
4. **IMPORTANT**: Disable after testing!

### Firefox:
1. Install: "CORS Everywhere" extension
2. Enable it
3. Test your app
4. **IMPORTANT**: Disable after testing!

---

## Verify the Fix

After applying any solution:

1. **Clear cache:**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   location.reload();
   ```

2. **Try to register:**
   - Go to `/register`
   - Fill form with valid data
   - Click "Create Account"
   - Should redirect to `/assistant`

3. **Check browser console (F12):**
   - Should see no red errors
   - Network tab should show successful requests (status 200)

---

## Current Status Check

### Test if Backend is Accessible:

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://stagev2.appletechlabs.com/api/auth/login" -Method POST -Body @{email="test@test.com"; password="test"}

# Mac/Linux
curl -X POST https://stagev2.appletechlabs.com/api/auth/login \
  -F "email=test@test.com" \
  -F "password=test"
```

If you get response = Backend is working, just needs CORS
If you get error = Backend might be down

---

## Recommended Approach

**For immediate frontend testing:**
→ Use **Solution 1** (Demo Mode)

**For development with real API:**
→ Use **Solution 2** (CORS Proxy)

**For production:**
→ Use **Solution 3** (Backend CORS setup)

---

## Need More Help?

1. Read: `TROUBLESHOOTING.md` - Detailed troubleshooting guide
2. Check: Browser console (F12) for specific errors
3. Test: API with Postman collection first
4. Contact: Backend team about CORS configuration

---

## Files Reference

- `src/services/api.js` - Current API configuration
- `src/services/api.demo.js` - Demo mode API (works offline)
- `TROUBLESHOOTING.md` - Complete troubleshooting guide
- `SETUP_GUIDE.md` - Complete setup and testing guide

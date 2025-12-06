# Local Testing Guide

## 🖥️ Run the Application Locally

### Step 1: Install Dependencies (if not done)

```bash
cd "C:\Users\LapMart\Downloads\Travel_Quotation_Assistant"
npm install
```

### Step 2: Set Environment Variables

**Option A: Use .env.local (Recommended)**

Create/edit `.env.local` file:
```env
# For local testing with direct backend
REACT_APP_API_URL=https://stagev2.appletechlabs.com/api

# Webhook URL
REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

**Option B: Use setupProxy.js (Already configured)**

The project already has `src/setupProxy.js` which proxies `/api` to the backend in development mode.

### Step 3: Start the Development Server

```bash
npm start
```

The app will open at: http://localhost:3000

### Step 4: Test Locally

1. **Open Browser Console (F12)** - IMPORTANT for debugging!

2. **Navigate to:** http://localhost:3000/login

3. **Login with your credentials**

4. **Go to Assistant page:** http://localhost:3000/assistant

5. **Send a test message**

6. **Watch the Console for logs:**
   ```
   [API] Using custom API URL: ...
   [WEBHOOK] Response Status: 200
   [WEBHOOK] Response Text: {...}
   [WEBHOOK] Parsed JSON Response: {...}
   ```

### Step 5: Debug the Webhook Response

Look for these console logs to see what the webhook returns:

```javascript
[WEBHOOK] Response Status: 200
[WEBHOOK] Content-Type: application/json
[WEBHOOK] Response Text: {"quotation_no":"123456","output":"Success"}
[WEBHOOK] Response Keys: ["quotation_no", "output"]
```

Share these logs with me and I can fix the parsing logic!

---

## 🔍 Test Backend API Locally

### Test Login API

```bash
curl -X POST "https://stagev2.appletechlabs.com/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=YOUR_EMAIL&password=YOUR_PASSWORD"
```

Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with real credentials.

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "Your Name",
    "email": "your@email.com"
  }
}
```

### Test Webhook Directly

```bash
curl -X POST "https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147" \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "5 days in Paris for 2 people",
    "sessionId": "test123"
  }'
```

**Expected Response:**
Should contain a quotation number field. Note what field name it uses!

---

## 🐛 Common Local Testing Issues

### Issue 1: CORS Errors in Development

**Error:**
```
Access to fetch at 'https://stagev2.appletechlabs.com/api/auth/login' has been blocked by CORS
```

**Solution:**
The `setupProxy.js` should handle this, but if it doesn't work:

1. Make sure you're running `npm start` (not just opening index.html)
2. Check that `src/setupProxy.js` exists
3. Restart the dev server

### Issue 2: Webhook Timeout

**Error:**
```
Failed to connect to the server. Please try again.
```

**Solution:**
1. Test webhook in Postman first to see if it responds
2. Check if webhook URL is correct
3. Webhook might be slow - wait longer
4. Check browser network tab (F12 → Network) to see actual response time

### Issue 3: Empty Webhook Response

**Error:**
```
Your quotation is being prepared. Our team will get back to you shortly...
```

**Solution:**
1. Open browser console (F12)
2. Look for `[WEBHOOK] Response Text:` log
3. If it's empty, the webhook isn't returning data
4. Test webhook in Postman to verify it works

### Issue 4: Module Not Found

**Error:**
```
Module not found: Can't resolve 'XXX'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Testing Checklist

Before deploying to Vercel, verify locally:

- [ ] `npm install` completes without errors
- [ ] `npm start` starts dev server successfully
- [ ] Can access http://localhost:3000
- [ ] Can login with valid credentials
- [ ] Console shows `[API] Using custom API URL:`
- [ ] Can send messages to assistant
- [ ] Console shows `[WEBHOOK]` logs
- [ ] Webhook returns a quotation number
- [ ] Quotation number displays correctly in UI

Once all checked, the Vercel deployment should work the same way!

---

## 🎯 Quick Test Commands

**Test webhook in terminal:**
```bash
curl -s -X POST "https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147" \
  -H "Content-Type: application/json" \
  -d '{"chatInput":"Paris trip","sessionId":"test"}' | jq
```

(If you have `jq` installed, it will format the JSON nicely)

**Or without jq:**
```bash
curl -s -X POST "https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147" \
  -H "Content-Type: application/json" \
  -d '{"chatInput":"Paris trip","sessionId":"test"}'
```

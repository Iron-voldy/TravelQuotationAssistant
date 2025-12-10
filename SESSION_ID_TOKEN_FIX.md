# 🔧 SESSION ID & TOKEN REFRESH - COMPLETE FIX

## Problems Identified & Fixed

### 1. **N8N Session ID Error**
**Error**: `No session ID found - Expected to find the session ID in an input field called 'sessionId'`

**Root Cause**: 
- The app was sending auth token as sessionId instead of a proper unique session identifier
- N8N expects a `sessionId` field, not the bearer token

**Fix Applied**:
- ✅ Changed sessionId generation to use unique chat IDs
- ✅ Each chat now has a persistent sessionId: `chat_ID_randomstring`
- ✅ N8N webhook now receives proper `{ chatInput, sessionId }`

---

### 2. **Token Refresh Issues**
**Problem**: 
- Tokens expire after 3600 seconds
- Refresh endpoint: `/api/auth/refresh` 
- NOT `/api/auth/register` (that's for registration)

**Fix Applied**:
- ✅ Fixed token refresh endpoint to use `/auth/refresh`
- ✅ Added token expiry tracking in localStorage
- ✅ Improved logging for token refresh process
- ✅ Token automatically refreshes 5 minutes before expiration

---

## Code Changes Made

### 1. **AuthContext.js** - Token Management
```javascript
// BEFORE: Minimal logging
console.log('[TOKEN REFRESH] Success! New token received');

// AFTER: Detailed logging
console.log('[TOKEN REFRESH] Success! New token received:', {
  hasAccessToken: !!data.access_token,
  expiresIn: data.expires_in
});

// Added token expiry tracking
localStorage.setItem('authTokenExpiry', Date.now() + (expiresIn * 1000));
console.log('[AUTH] Token expiry time:', new Date(...).toISOString());
```

### 2. **TravelQuotationPage.jsx** - SessionId Generation
```javascript
// BEFORE: Using auth token as sessionId
sessionId: token  // ❌ Wrong - N8N expects unique session ID

// AFTER: Generate unique sessionId for each chat
const sessionId = chatId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
console.log('[SEND MESSAGE] Session ID for N8N:', sessionId);
```

### 3. **Apple 2.html** - Chat SessionId Management
```javascript
// Each chat now stores its own sessionId
const newChat = {
    id: chatId,
    sessionId: sessionId,  // Unique for N8N webhook
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    messages: [],
};

// When sending to N8N:
body: JSON.stringify({
    chatInput: message,
    sessionId: chat.sessionId  // ✅ Proper sessionId
})
```

---

## How It Works Now

### Login Flow
```
1. User logs in
   ↓
2. Backend returns: { access_token, expires_in: 3600 }
   ↓
3. Frontend stores:
   - authToken = JWT bearer token
   - authTokenExpiry = current_time + 3600000ms
   ↓
4. Token refresh timer starts
   - Triggers 5 minutes before expiration
   - Calls: /api/auth/refresh with current token
   - Gets new token and resets timer
```

### Chat SessionId Flow
```
1. New chat created
   ↓
2. Unique sessionId generated: chat_1765380000_abc123
   ↓
3. User sends message
   ↓
4. Frontend sends to N8N:
   {
     chatInput: "user message",
     sessionId: "chat_1765380000_abc123"  // ← N8N reads this
   }
   ↓
5. N8N processes with proper session context
```

---

## API Endpoints (CORRECT)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user |

**Important**: Token refresh uses `/auth/refresh`, NOT `/auth/register`

---

## Token Lifecycle

```
Time 0s: User logs in
         ↓
         Token received: expires_in = 3600s
         ↓
         Stored in localStorage + Timer set

Time 3300s (55 min): Refresh timer triggers
         ↓
         Frontend calls: POST /api/auth/refresh
         ↓
         Backend returns new token
         ↓
         New token stored + Timer reset

Time 7200s: Still logged in with fresh token
         ↓
         Refresh timer triggers again
         ↓
         Cycle repeats...
```

---

## How to Test

### 1. Test Login & Token Refresh
```bash
# 1. Login
curl -X POST https://stagev2.appletechlabs.com/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=john@example.com&password=secret1"

# Expected Response:
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer",
  "expires_in": 3600
}

# 2. After 55 minutes, token auto-refreshes via frontend
# 3. Check console for: [TOKEN REFRESH] Success! New token received

# 4. Manually test refresh:
curl -X POST https://stagev2.appletechlabs.com/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# Should return new token
```

### 2. Test SessionId in Chat
```javascript
// Browser Console - Check chat creation
// You'll see session ID like: chat_1765380000_abc123

// Check Network tab - Look at N8N webhook request:
{
  "chatInput": "10 days in Japan",
  "sessionId": "chat_1765380000_abc123"  // ← This should be present
}

// If you see `sessionId: null`, there's still an issue
```

### 3. Check Token Expiry
```javascript
// Browser Console
localStorage.getItem('authTokenExpiry')
// Shows: 1765380000000 (timestamp in milliseconds)

new Date(parseInt(localStorage.getItem('authTokenExpiry'))).toISOString()
// Shows: 2025-12-10T15:30:00.000Z (when token expires)
```

---

## Troubleshooting

### Issue 1: "No session ID found" from N8N
**Cause**: sessionId not being sent to webhook

**Fix**:
```javascript
// Check browser console shows:
// [SEND MESSAGE] Session ID for N8N: chat_1765...

// If it shows null, the chat wasn't created properly
createNewChat();  // Force create new chat
```

### Issue 2: "Token refresh failed: 401"
**Cause**: Token is invalid or already expired

**Fix**:
```javascript
// Check when token expires:
const expiry = localStorage.getItem('authTokenExpiry');
const now = Date.now();
console.log('Token expires in:', (expiry - now) / 1000, 'seconds');

// If negative, token is expired - need to login again
// If less than 5 minutes, should trigger refresh automatically
```

### Issue 3: Can't refresh token
**Cause**: Token refresh endpoint might be down or configured wrong

**Fix**:
```javascript
// Check console shows correct endpoint:
// [TOKEN REFRESH] Using endpoint: https://stagev2.appletechlabs.com/api/auth/refresh

// If not showing, check environment variable:
echo $REACT_APP_API_URL
// Should be: https://stagev2.appletechlabs.com/api
```

---

## Files Modified

✅ `src/context/AuthContext.js`
- Added better token refresh logging
- Added token expiry tracking in localStorage
- Fixed endpoint confirmation

✅ `src/pages/TravelQuotationPage.jsx`
- Generate proper sessionId instead of using token
- Added debug logging for N8N webhook payload
- Validate token before sending message

✅ `Apple 2.html`
- Fixed createNewChat to generate unique sessionId
- SessionId persists for entire chat session
- Sends sessionId to N8N webhook

---

## Deployment Checklist

- [ ] Code changes deployed to GitHub
- [ ] Environment variables set in Vercel:
  - [ ] `REACT_APP_API_URL=https://stagev2.appletechlabs.com/api`
  - [ ] `REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/...`
- [ ] Build cache cleared on Vercel
- [ ] Fresh deployment completed
- [ ] Tested login with new credentials
- [ ] Opened browser DevTools console
- [ ] Checked "[TOKEN REFRESH]" messages appear
- [ ] Checked "[SEND MESSAGE] Session ID:" shows proper value
- [ ] Tested sending message to N8N - no "No session ID" error
- [ ] Waited 55+ minutes to verify auto-refresh works

---

## Important Notes

**DON'T DO**:
- ❌ Send auth token as sessionId to N8N
- ❌ Use `/auth/register` for token refresh (that's for registration)
- ❌ Hardcode webhook URL - use environment variables
- ❌ Store JWT tokens in plain localStorage without tracking expiry

**DO**:
- ✅ Generate unique sessionId per chat/session
- ✅ Track token expiry with proper timestamps
- ✅ Auto-refresh 5 minutes before expiration
- ✅ Use `/auth/refresh` endpoint for token refresh
- ✅ Log authentication events for debugging
- ✅ Handle token refresh failures gracefully

---

**Status**: All fixes applied ✅ Ready for deployment!

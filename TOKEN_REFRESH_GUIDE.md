# Token Refresh Implementation Guide

## Overview
The Travel Quotation Assistant now implements automatic token refresh functionality. When a user logs in, the system automatically handles token expiration and refreshes the token before it expires, ensuring seamless user experience.

---

## How It Works

### 1. Token Lifecycle
```
Login → Receive Token + Expires_in (3600s)
  ↓
Set up Refresh Timer (expires_in - 5 minutes)
  ↓
User continues using app
  ↓
5 minutes before expiration → Auto-refresh token
  ↓
Receive New Token + Expires_in
  ↓
Repeat cycle...
```

### 2. Login Response Format
The backend returns:
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

| Field | Description |
|-------|-------------|
| access_token | JWT token for API authentication |
| token_type | Bearer token type |
| expires_in | Token expiration time in seconds (typically 3600 = 1 hour) |

---

## Implementation Details

### AuthContext.js Changes
The `AuthContext` now includes:

#### New State Variables
```javascript
const [expiresIn, setExpiresIn] = useState(null);
const refreshTimeoutRef = useRef(null);
```

#### Token Refresh Function
```javascript
const refreshAuthToken = async (currentToken) => {
  const response = await fetch(
    'https://stagev2.appletechlabs.com/api/auth/refresh',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );
  return data.access_token;
}
```

#### Token Refresh Timer Setup
```javascript
const setupTokenRefreshTimer = useCallback((tokenExpiresIn, currentToken) => {
  // Refresh 5 minutes before expiration
  const refreshTime = (tokenExpiresIn - 300) * 1000;
  
  refreshTimeoutRef.current = setTimeout(async () => {
    const newToken = await refreshAuthToken(currentToken);
    if (newToken) {
      // Update token and reschedule refresh
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setupTokenRefreshTimer(3600, newToken);
    } else {
      // If refresh fails, logout
      logout();
    }
  }, refreshTime);
}, []);
```

#### Updated Login Function
```javascript
const login = (userData, authToken, expiresIn = 3600) => {
  localStorage.setItem('authToken', authToken);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('tokenExpiresIn', expiresIn.toString());
  
  setToken(authToken);
  setUser(userData);
  setExpiresIn(expiresIn);
  setIsAuthenticated(true);

  // Set up automatic token refresh
  setupTokenRefreshTimer(expiresIn, authToken);
}
```

---

## Updated Components

### LoginPage.jsx
Now extracts and passes `expires_in`:
```javascript
const response = await authAPI.login(formData.email, formData.password);
const expiresIn = response.expires_in || 3600;
login(userData, authToken, expiresIn);
```

### RegisterPage.jsx
Same implementation as LoginPage:
```javascript
const expiresIn = response.expires_in || 3600;
login(userData, authToken, expiresIn);
```

---

## Token Refresh Endpoint

### Endpoint Details
```
Method: POST
URL: https://stagev2.appletechlabs.com/api/auth/refresh
```

### Request Headers
```
Authorization: Bearer {current_token}
Content-Type: application/json
Accept: application/json
```

### Request Body
```json
{}
```
(Empty body, token validation happens via Bearer header)

### Response Format
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

---

## LocalStorage Management

The system stores:

| Key | Value | Purpose |
|-----|-------|---------|
| authToken | JWT token | API authentication |
| user | JSON user data | Current user info |
| tokenExpiresIn | Expiration time (s) | Token lifecycle tracking |

---

## Console Logging

The implementation includes detailed console logs for debugging:

```
[AUTH] Logging in user: email@example.com
[AUTH] Token refresh scheduled in 3300s
[TOKEN REFRESH] Attempting to refresh token...
[TOKEN REFRESH] Success! New token received
[AUTH] Logging out user
```

---

## Security Features

### 1. Early Refresh
- Token is refreshed **5 minutes before expiration**
- Prevents user being logged out mid-action
- Provides buffer for network delays

### 2. Automatic Cleanup
- Logout properly clears all timers
- Prevents memory leaks
- Removes all stored credentials

### 3. Error Handling
- If token refresh fails, user is automatically logged out
- Graceful degradation instead of app errors
- Clear error logging for debugging

### 4. Token Validation
- Uses `Authorization: Bearer` header for validation
- No token passed in request body (more secure)
- Server-side JWT validation

---

## Testing Token Refresh

### Manual Testing Steps:

1. **Login**
   ```
   POST /api/auth/login
   Email: test@example.com
   Password: password123
   Response: access_token + expires_in
   ```

2. **Check Console**
   - Open browser DevTools (F12)
   - Look for `[AUTH] Token refresh scheduled` message

3. **Wait for Auto-Refresh**
   - Wait ~55 minutes (or modify code for testing)
   - Watch console for `[TOKEN REFRESH] Success!` message

4. **Verify Token Updated**
   - Check localStorage for updated authToken
   - Token value should be different

### Postman Testing (Manual Refresh)

**Request:**
```
Method: POST
URL: https://stagev2.appletechlabs.com/api/auth/refresh
Header: Authorization: Bearer {your_token}
```

**Expected Response:**
```json
{
    "access_token": "new_token_here",
    "token_type": "bearer",
    "expires_in": 3600
}
```

---

## Potential Issues & Solutions

### Issue: Token not refreshing automatically

**Symptoms:**
- After 1 hour, API calls fail with 401
- No refresh message in console

**Solution:**
1. Check console for error messages
2. Verify refresh endpoint is accessible
3. Check that `expiresIn` was captured during login
4. Clear browser cache and re-login

---

### Issue: User logged out unexpectedly

**Symptoms:**
- Redirected to login page suddenly
- Token refresh failed message

**Possible Causes:**
1. Network error during refresh
2. Token became invalid on server
3. Backend took too long to respond

**Solution:**
1. Check console logs
2. Verify backend is running
3. Check network requests in DevTools

---

### Issue: Multiple token refreshes happening

**Symptoms:**
- Multiple "[TOKEN REFRESH]" messages in console
- Performance degradation

**Solution:**
1. This shouldn't happen due to timer cleanup
2. Clear browser storage and re-login
3. Check for multiple AuthProvider instances

---

## Best Practices

### For Frontend Developers:
1. ✅ Always pass `expiresIn` from login endpoint
2. ✅ Monitor console for token refresh logs during testing
3. ✅ Test with actual API delays (throttle network)
4. ✅ Clear localStorage when debugging

### For API Developers:
1. ✅ Ensure `/auth/refresh` endpoint validates current token
2. ✅ Return new token with `expires_in` value
3. ✅ Handle expired tokens gracefully
4. ✅ Log token refresh requests for audit trail

---

## Configuration

If you need to modify refresh timing:

**In AuthContext.js:**
```javascript
// Change refresh buffer (currently 5 minutes = 300 seconds)
const refreshTime = (tokenExpiresIn - 300) * 1000;  // ← Modify 300

// Change default expiration time
const expiresIn = response.expires_in || 3600;  // ← Modify 3600
```

---

## Environment Considerations

### Development
- Token expires every 3600 seconds (1 hour)
- Auto-refresh 5 minutes before expiration
- Full console logging enabled

### Production
- Same token refresh logic applies
- Consider adjusting refresh buffer based on network latency
- Monitor token refresh failures in error tracking

---

## API Integration Checklist

- [x] Backend returns `expires_in` in login response
- [x] Refresh endpoint implemented at `https://stagev2.appletechlabs.com/api/auth/refresh`
- [x] Refresh endpoint accepts `Authorization: Bearer` header
- [x] Refresh endpoint returns new `access_token` and `expires_in`
- [x] Frontend properly stores and uses token
- [x] Frontend properly handles failed refreshes

---

## Summary

The token refresh system:
- ✅ Automatically refreshes tokens 5 minutes before expiration
- ✅ Maintains user session seamlessly
- ✅ Handles failures gracefully
- ✅ Includes comprehensive logging
- ✅ Cleans up resources on logout
- ✅ Works with existing API infrastructure

---

Created: December 5, 2025
Version: 1.0
Status: Ready for Production

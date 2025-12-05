# Quick Setup & Testing Guide

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## API Configuration

### Backend API
- **Base URL**: `https://stagev2.appletechlabs.com/api`
- **Authentication**: Bearer Token (JWT)

### Webhook
- **URL**: `https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147`

## Testing the Application

### 1. Test Registration
Navigate to `/register` or click "Create one now" from login page.

**Required Fields:**
- **Full Name**: Your name (min 3 characters)
- **Email**: Valid email address
- **Password**: Min 8 chars, must include:
  - Uppercase letter (A-Z)
  - Lowercase letter (a-z)
  - Number (0-9)
- **Confirm Password**: Must match password
- **Terms**: Must be checked

**Example Data:**
```
Name: John Doe
Email: john@example.com
Password: Test1234
Confirm Password: Test1234
```

**API Call:**
```
POST https://stagev2.appletechlabs.com/api/auth/register
Content-Type: multipart/form-data

Body (FormData):
- name: "John Doe"
- email: "john@example.com"
- password: "Test1234"
- password_confirmation: "Test1234"
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1Q...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Test Login
Navigate to `/login`

**Required Fields:**
- **Email**: Registered email
- **Password**: Your password

**Example Data:**
```
Email: john@example.com
Password: Test1234
```

**API Call:**
```
POST https://stagev2.appletechlabs.com/api/auth/login
Content-Type: multipart/form-data

Body (FormData):
- email: "john@example.com"
- password: "Test1234"
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1Q...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Test Travel Assistant
After successful login, you'll be redirected to `/assistant`

**Test Conversation:**
1. Click "New Chat"
2. Type a travel request, for example:
   ```
   I need a 7-day trip to Bali for 2 adults
   ```
3. Press Enter or click Send

**Webhook Call:**
```
POST https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
Content-Type: application/json

Body:
{
  "chatInput": "I need a 7-day trip to Bali for 2 adults",
  "sessionId": "session_1234567890_abc123"
}
```

**Expected Response:**
```json
{
  "quotation_no": "370442",
  "message": "Your quotation has been created",
  "output": "Details about the trip..."
}
```

## Authentication Flow

### Registration Flow
1. User fills registration form
2. Frontend validates input
3. POST to `/api/auth/register` with FormData
4. API returns JWT token and user data
5. Token stored in localStorage as `authToken`
6. User stored in localStorage as `user`
7. User auto-logged in and redirected to `/assistant`

### Login Flow
1. User enters credentials
2. Frontend validates input
3. POST to `/api/auth/login` with FormData
4. API returns JWT token and user data
5. Token stored in localStorage as `authToken`
6. User stored in localStorage as `user`
7. AuthContext updates `isAuthenticated` to true
8. User redirected to `/assistant`

### Protected Routes
- `/assistant` requires authentication
- If not authenticated, redirected to `/login`
- Authentication checked via `isAuthenticated` from AuthContext

### Token Usage
All authenticated API calls include:
```
Authorization: Bearer <access_token>
```

Example authenticated API calls:
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user
- POST `/api/auth/refresh` - Refresh token
- GET `/api/quotation/list` - List quotations
- POST `/api/booking/save` - Save booking

## Troubleshooting

### Issue: Registration/Login fails with CORS error
**Solution**: Backend must allow CORS from `http://localhost:3000`

### Issue: "No authentication token received"
**Solution**: Check API response structure. Token might be in different field.

### Issue: Bearer token not working
**Solution**:
- Check token is being stored: Open DevTools > Application > Local Storage
- Verify `authToken` key exists
- Check Authorization header in Network tab

### Issue: Webhook not responding
**Solution**:
- Verify webhook URL is correct
- Check network connectivity
- Test webhook separately using Postman

### Issue: ESLint warnings
**Solution**: Warnings are non-critical. App will still run. To disable:
```javascript
// eslint-disable-next-line
```

## Development Tips

### View Stored Data
Open Browser DevTools:
- **Application > Local Storage** - View saved tokens and chats
- **Network** - Monitor API calls
- **Console** - View error messages

### Clear All Data
To reset and test fresh:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Test Different Scenarios

1. **Test validation errors:**
   - Try invalid email
   - Try weak password
   - Try mismatched passwords

2. **Test session persistence:**
   - Login
   - Refresh page
   - Should still be logged in

3. **Test logout:**
   - Click logout
   - Should redirect to login
   - Should clear localStorage

4. **Test multiple chats:**
   - Create 3-4 different chats
   - Switch between them
   - Delete a chat
   - Create new chat after deleting

## API Testing with Postman

You can import the provided Postman collection:
`Apple Holidays APIs Stage.postman_collection (2).json`

### Important Endpoints

1. **Login**
   - Method: POST
   - URL: `{{api_url}}/api/auth/login`
   - Body: formdata (email, password)

2. **Register**
   - Method: POST
   - URL: `{{api_url}}/api/auth/register`
   - Body: formdata (name, email, password, password_confirmation)

3. **Get User Info**
   - Method: GET
   - URL: `{{api_url}}/api/auth/me`
   - Auth: Bearer Token

4. **Logout**
   - Method: POST
   - URL: `{{api_url}}/api/auth/logout`
   - Auth: Bearer Token

## Production Deployment

Before deploying:

1. Update API URLs if needed
2. Set up environment variables
3. Run production build:
   ```bash
   npm run build
   ```
4. Deploy `build` folder to hosting service

## Support

For issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify API is accessible
4. Check bearer token is valid

## Notes

- All API calls use FormData for login/register (not JSON)
- Bearer token automatically included for authenticated routes
- Chat history saved in localStorage
- Session persists across page refreshes
- Mobile-responsive design works on all devices

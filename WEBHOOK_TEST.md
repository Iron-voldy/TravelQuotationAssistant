# Webhook Testing Guide

## 🧪 Test Webhook with Postman

### 1. Postman Request Setup

**Method:** `POST`

**Primary Webhook URL:**
```
https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

**Alternative Webhook URL (from working HTML):**
```
https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - CORRECT FORMAT:**
```json
{
  "chatInput": "I need a trip to Paris for 2 people, 5 days",
  "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3N0YWdldjIuYXBwbGV0ZWNobGFicy5jb20vYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE3MzM0OTY4MjIsImV4cCI6MTczMzUwMDQyMiwibmJmIjoxNzMzNDk2ODIyLCJqdGkiOiJLc2JScnpYMHNNVXdIcDZYIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.abc123xyz"
}
```

⚠️ **CRITICAL REQUIREMENTS:**
1. The format is a **simple JSON object**, NOT an array!
2. **sessionId is REQUIRED** - n8n expects this field to exist
3. **sessionId MUST be the user's authentication JWT token** (not a random string)
4. The token is obtained after successful login
5. Token auto-refreshes every 3600 seconds (1 hour)
6. If sessionId is missing or undefined, n8n will return error: "No session ID found"

### How to Get the Auth Token:

1. **Login to get token:**
   ```bash
   curl -X POST "https://stagev2.appletechlabs.com/api/auth/login" \
     -H "Content-Type: multipart/form-data" \
     -F "email=your@email.com" \
     -F "password=yourpassword"
   ```

2. **Extract `access_token` from response:**
   ```json
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "token_type": "bearer",
     "expires_in": 3600
   }
   ```

3. **Use that token as sessionId in webhook:**
   ```json
   {
     "chatInput": "10 Days to Sri Lanka for 3 people",
     "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

### 2. Expected Response Format

Your webhook should return JSON with a `quotation_no` field:

**Success Response:**
```json
{
  "quotation_no": "123456",
  "output": "Your quotation has been created",
  "success": true
}
```

Or any of these field names:
- `quotation_no`
- `quotation_number`
- `reference_id`
- `request_no`
- `refno`
- `id`

### 3. Import to Postman

**Option A: Manual Setup**
1. Open Postman
2. Create new request
3. Set Method to POST
4. Enter the URL above
5. Go to Headers tab, add `Content-Type: application/json`
6. Go to Body tab, select "raw" and "JSON"
7. Paste the JSON body
8. Click "Send"

**Option B: Import cURL**

Test with primary webhook:
```bash
curl -X POST "https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147" \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "I need a trip to Paris for 2 people, 5 days",
    "sessionId": "test_session_123"
  }'
```

Or test with alternative webhook (from working Apple 2.html):
```bash
curl -X POST "https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342" \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "10 Days to sri lanka for 3 peoples",
    "sessionId": "test_session_456"
  }'
```

Copy the cURL command above and import it into Postman:
1. Click "Import" button in Postman
2. Select "Raw text"
3. Paste the cURL command
4. Click "Import"

### 4. What to Check

After sending the request, check the response:

✅ **Status Code:** Should be `200 OK`

✅ **Response Time:** Should be reasonable (under 30 seconds)

✅ **Response Body:** Should contain:
- A quotation/reference number field
- Success indicator
- Output message

❌ **Common Issues:**
- 404 Not Found → Wrong webhook URL
- 500 Internal Server Error → Webhook has errors
- Timeout → Webhook is too slow
- Empty response → Webhook doesn't return data

### 5. Test Different Scenarios

**Test 1: With valid auth token**
```json
{
  "chatInput": "Paris trip for 2 people",
  "sessionId": "YOUR_JWT_TOKEN_HERE"
}
```
Replace `YOUR_JWT_TOKEN_HERE` with actual token from login response.

**Test 2: Detailed request with token**
```json
{
  "chatInput": "I want to visit Tokyo, Japan for 10 days. 4 people, budget $5000",
  "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Test 3: Missing sessionId (should fail with error)**
```json
{
  "chatInput": "Sri Lanka 10 days"
}
```
Expected error: **"No session ID found"**

**Test 4: Get auth token programmatically**
```javascript
// 1. Login first
const loginResponse = await fetch('https://stagev2.appletechlabs.com/api/auth/login', {
  method: 'POST',
  body: formData // with email and password
});
const { access_token } = await loginResponse.json();

// 2. Use token as sessionId
const webhookResponse = await fetch('https://aahaas-ai.app.n8n.cloud/webhook/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatInput: "10 days to Sri Lanka",
    sessionId: access_token  // ← Use auth token here
  })
});
```

### 6. Document the Response

Once you get a response, note down:
1. **What field contains the quotation number?**
   - Is it `quotation_no`, `reference_id`, or something else?
2. **What is the response structure?**
   - Is it a simple object or nested?
3. **Are there any error responses?**
   - How does the webhook indicate failure?

Share this information and I'll update the code to properly parse it!

---

## 🔧 Webhook URL Configuration

### Current Setup

**Your React App uses:**
```
https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

**Apple 2.html (Working) uses:**
```
https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342
```

### Important Notes:

1. **Different webhooks** = Different endpoints, possibly different workflows
2. If your React app doesn't work but Apple 2.html does, you might need to:
   - Update `REACT_APP_WEBHOOK_URL` in your `.env` file to match the working URL
   - Or ask your backend developer which webhook URL is correct

### To Update Webhook URL:

1. Create/edit `.env` file in project root:
   ```
   REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342
   ```

2. Restart your dev server:
   ```bash
   npm start
   ```

3. Or update in `src/services/api.js` line 30 directly

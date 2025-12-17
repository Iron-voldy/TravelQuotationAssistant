# Configure n8n to Use Dynamic Bearer Token

## What Changed

The frontend now sends the user's Bearer token to n8n in the webhook payload:

```json
{
  "chatInput": "5 days trip to sri lanka",
  "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "bearerToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."  ← NEW!
}
```

Now you need to configure n8n to USE this dynamic token instead of a static credential.

## Why This Fixes the Authorization Issue

Before:
- n8n used a static Bearer token (which was invalid/expired)
- Result: "Authorization failed" in Get City ID from API nodes

After:
- n8n uses the logged-in user's token (fresh and valid)
- Token auto-refreshes when user refreshes their session
- No more manual token updates needed!

---

## Step-by-Step: Configure n8n Nodes

### Step 1: Extract Bearer Token in Workflow

After the "Code in JavaScript" node, add a new Code node to extract the token:

1. Open your workflow in n8n editor
2. After "Code in JavaScript" node, click the **+** button
3. Add a new **"Code"** node
4. Name it: **"Extract Bearer Token"**
5. Paste this code:

```javascript
// Extract bearer token from webhook body
const webhookData = $('Webhook').first().json.body;
const bearerToken = webhookData.bearerToken;

// Add token to the data for use by other nodes
return {
  json: {
    ...webhookData,
    bearerToken: bearerToken
  }
};
```

6. Click **Save**
7. Connect "Code in JavaScript" → "Extract Bearer Token" → "Is Update Request?"

### Step 2: Configure "Get City ID from API" Node

1. Click on **"Get City ID from API"** node
2. Under **"Authentication"**, change from "Predefined Credential Type" to **"Generic Credential Type"**
3. Select **"Header Auth"**
4. Configure:
   - **Name**: `Authorization`
   - **Value**: Click the expression icon (fx) and enter:
     ```
     =Bearer {{ $('Extract Bearer Token').first().json.bearerToken }}
     ```

5. Click **Save**

### Step 3: Configure "Get City ID from API1" Node

Same as above:
1. Click on **"Get City ID from API1"** node
2. Authentication → **"Header Auth"**
3. Name: `Authorization`
4. Value (expression):
   ```
   =Bearer {{ $('Extract Bearer Token').first().json.bearerToken }}
   ```
5. Click **Save**

### Step 4: Configure "Send to Backend API" Node

Same as above:
1. Click on **"Send to Backend API"** node
2. Authentication → **"Header Auth"**
3. Name: `Authorization`
4. Value (expression):
   ```
   =Bearer {{ $('Extract Bearer Token').first().json.bearerToken }}
   ```
5. Click **Save**

### Step 5: Save Workflow

1. Click **Save** button at top-right
2. Ensure workflow is **ACTIVE** (toggle should be green)

---

## Alternative Method: Simpler Approach

If the above seems complex, use this simpler method:

### For each node (Get City ID from API, Get City ID from API1, Send to Backend API):

1. Click on the node
2. Scroll to **"Options"** section
3. Click **"Add Option"** → **"Header"**
4. Add a new header:
   - **Name**: `Authorization`
   - **Value**: Click expression icon (fx) and enter:
     ```
     =Bearer {{ $('Webhook').first().json.body.bearerToken }}
     ```
5. Keep Authentication as **"None"** (we're using manual header instead)
6. Click **Save**

Repeat for all three nodes.

---

## Testing the Configuration

### Test 1: Manual Test in n8n

1. Go to workflow editor
2. Click **"Execute Workflow"**
3. In the "Webhook" node, paste this test data:

```json
{
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "chatInput": "3 days trip to sri lanka",
    "sessionId": "test_session_123",
    "bearerToken": "YOUR_ACTUAL_TOKEN_HERE"
  }
}
```

4. Replace `YOUR_ACTUAL_TOKEN_HERE` with a real token (get it from login)
5. Click **Execute**
6. Check if all nodes turn **GREEN**
7. Verify you get a quotation_no in the response

### Test 2: Get a Real Token

To get a real Bearer token for testing:

1. Login to Travel Quotation Assistant with john@example.com / secret1
2. Open browser DevTools (F12)
3. Go to **Application** → **Local Storage**
4. Copy the value of `authToken`
5. Use this in the test above

### Test 3: From Frontend

1. Login to the app with john@example.com / secret1
2. Send a message: "5 days trip to sri lanka"
3. Check browser console for:
   ```
   [WEBHOOK] Bearer Token Present: true
   [WEBHOOK] Bearer Token (first 20 chars): eyJ0eXAiOiJKV1QiLCJh...
   ```
4. Wait 2-3 minutes
5. You should see: "Your Request No is [quotation_no]"

---

## Token Auto-Refresh

The token expires after 3600 seconds (1 hour). The frontend handles this automatically:

In `AuthContext.jsx`, there's a token refresh mechanism:
- Checks token expiration
- Automatically calls `/api/auth/refresh` before expiration
- Updates localStorage with new token
- Next n8n call will use the fresh token

So you don't need to worry about token expiration - it's handled automatically!

---

## Troubleshooting

### If still getting "Authorization failed":

1. **Check token is being sent:**
   - Open browser console
   - Send a message
   - Look for: `[WEBHOOK] Bearer Token Present: true`
   - If false, user might not be logged in

2. **Check n8n is receiving token:**
   - Go to n8n Executions
   - Click latest execution
   - Click "Webhook" node
   - Check if `body.bearerToken` exists in the data

3. **Check nodes are using token:**
   - Click on "Get City ID from API" node
   - Check the Authorization header shows the token
   - Should show: `Bearer eyJ0eXAiOiJKV1QiLCJ...`

4. **Check token is valid:**
   - Copy the token from n8n execution
   - Test it manually:
     ```bash
     curl -H "Authorization: Bearer TOKEN_HERE" \
       https://applev2.appletechlabs.com/api/content/place/?name=Kandy
     ```
   - Should return city data, not 401 error

### If token is valid but still fails:

- The backend API URL might be wrong
- The backend server might be down
- CORS might be blocking the request
- The API endpoint might require additional parameters

---

## Summary of Changes

### Frontend Changes ✅
- Updated `api.js` to send `bearerToken` in webhook payload
- Token is automatically extracted from localStorage (set during login)
- Token auto-refreshes before expiration

### n8n Changes (YOU NEED TO DO)
- Extract bearerToken from webhook body
- Configure 3 nodes to use dynamic token:
  - Get City ID from API
  - Get City ID from API1
  - Send to Backend API
- Use Header Auth with expression: `=Bearer {{ $json.bearerToken }}`

### Result 🎉
- User logs in → gets token
- User sends message → frontend sends token to n8n
- n8n uses user's token to call backend APIs
- No more "Authorization failed" errors!
- Quotation created successfully
- Frontend displays: "Your Request No is [quotation_no]"

---

## Quick Reference: n8n Expression

For all three HTTP nodes, use this in Authorization header:

```javascript
=Bearer {{ $('Webhook').first().json.body.bearerToken }}
```

Or if you added "Extract Bearer Token" node:

```javascript
=Bearer {{ $('Extract Bearer Token').first().json.bearerToken }}
```

That's it! Once configured, it will work automatically! 🚀

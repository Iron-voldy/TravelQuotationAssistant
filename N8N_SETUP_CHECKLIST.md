# n8n Workflow Setup Checklist

## Overview
This checklist helps you set up the Travel Quotation workflow in your own n8n instance for testing.

---

## Prerequisites

You need accounts for:
- [ ] n8n instance (cloud or self-hosted)
- [ ] OpenAI account with API key
- [ ] Google account with access to Google Sheets
- [ ] Backend API access at `applev2.appletechlabs.com`

---

## Step 1: Import Workflow to Your n8n

1. [ ] Open your n8n instance
2. [ ] Click **Workflows** → **"+"** → **"Import from File"**
3. [ ] Select `Apple-Quatation-Live (2).json`
4. [ ] Workflow imported successfully
5. [ ] Note: All nodes will show error icons (missing credentials) - this is expected

---

## Step 2: Create OpenAI Credential

1. [ ] Go to https://platform.openai.com/api-keys
2. [ ] Create a new API key or use existing one
3. [ ] In n8n: **Settings** → **Credentials** → **"+ Add Credential"**
4. [ ] Search for **"OpenAI"**
5. [ ] Paste your API key
6. [ ] Name: `OpenAi account` (or any name you prefer)
7. [ ] Click **Save**
8. [ ] Test it (optional): The credential should validate successfully

### Assign to Nodes:
- [ ] **AI Agent** node → Select your OpenAI credential
- [ ] **AI Agent1** node → Select your OpenAI credential
- [ ] **OpenAI Chat Model** node → Select your OpenAI credential
- [ ] **OpenAI Chat Model1** node → Select your OpenAI credential

---

## Step 3: Create Google Sheets Credential

1. [ ] In n8n: **Settings** → **Credentials** → **"+ Add Credential"**
2. [ ] Search for **"Google Sheets OAuth2 API"**
3. [ ] Click **"Connect my account"**
4. [ ] Sign in with Google account
5. [ ] Grant permissions to n8n
6. [ ] Name: `Google Sheets account`
7. [ ] Click **Save**

### Assign to Nodes:
- [ ] **Get row(s) in sheet** → Select Google Sheets credential
- [ ] **Get Activities Sheet** → Select Google Sheets credential
- [ ] **Store in Google Sheets** → Select Google Sheets credential
- [ ] **Get Booking from Sheets** → Select Google Sheets credential

---

## Step 4: Set Up Google Sheet (Data Storage)

### Option A: Use Existing Sheet
1. [ ] Get access to the existing Google Sheet (ID: `1n-xL0h9PHeOhfcpytCouV7_pkYj4BzSMZghqTsKrgYo`)
2. [ ] Make sure your Google account has edit access
3. [ ] Skip to Step 5

### Option B: Create New Sheet
1. [ ] Create new Google Sheet
2. [ ] Name it: `Travel Quotations`
3. [ ] Create these sheets (tabs):
   - [ ] **Sheet8** - Main data storage
   - [ ] **Activities** - Activities data
   - [ ] **Bookings** - Booking records

4. [ ] Set up columns in Sheet8:
   ```
   | quotation_no | reference_id | customer_name | destination | days | adults | children | check_in | check_out | ... |
   ```

5. [ ] Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

6. [ ] Update all Google Sheets nodes with your Sheet ID:
   - [ ] **Get row(s) in sheet** → Document ID
   - [ ] **Get Activities Sheet** → Document ID
   - [ ] **Store in Google Sheets** → Document ID
   - [ ] **Get Booking from Sheets** → Document ID

---

## Step 5: Configure Backend API Authentication (CRITICAL!)

These 3 nodes call your backend API and need Bearer authentication:

### Node 1: Get City ID from API

1. [ ] Open **"Get City ID from API"** node
2. [ ] **URL**: `https://applev2.appletechlabs.com/api/content/place/?name={{ $json.City }}`
3. [ ] **Authentication**: Select **"None"** (remove any predefined credential)
4. [ ] Scroll to **"Options"** section
5. [ ] Click **"Add Option"** → Select **"Header"**
6. [ ] Configure header:
   - **Name**: `Authorization`
   - **Value**: Click **fx icon** (expression mode) and enter:
     ```
     =Bearer {{ $('Webhook').first().json.body.bearerToken }}
     ```
7. [ ] Click **Save**

### Node 2: Get City ID from API1

1. [ ] Open **"Get City ID from API1"** node
2. [ ] **URL**: `https://applev2.appletechlabs.com/api/content/place/?name={{ $json.City }}`
3. [ ] **Authentication**: **"None"**
4. [ ] Add **Header** in Options:
   - **Name**: `Authorization`
   - **Value** (expression): `=Bearer {{ $('Webhook').first().json.body.bearerToken }}`
5. [ ] Click **Save**

### Node 3: Send to Backend API

1. [ ] Open **"Send to Backend API"** node
2. [ ] **Method**: POST
3. [ ] **URL**: `https://applev2.appletechlabs.com/api/booking/save`
4. [ ] **Authentication**: **"None"**
5. [ ] **Send Body**: Yes
6. [ ] **Body Content Type**: JSON
7. [ ] **JSON/RAW Body**: `={{ $json }}`
8. [ ] Add **Header** in Options:
   - **Name**: `Authorization`
   - **Value** (expression): `=Bearer {{ $('Webhook').first().json.body.bearerToken }}`
9. [ ] Click **Save**

**Why this works:**
- Frontend sends `bearerToken` in the webhook payload
- n8n extracts it: `$('Webhook').first().json.body.bearerToken`
- Uses it in Authorization header: `Bearer [token]`
- Backend validates the token and allows the request

---

## Step 6: Get Your Webhook URL

1. [ ] In your workflow, click the **"Webhook"** node
2. [ ] Look for **"Production URL"** or **"Webhook URL"**
3. [ ] Copy the full URL, it will look like:
   ```
   https://your-n8n-instance.com/webhook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
4. [ ] Save this URL - you'll need it for frontend configuration

---

## Step 7: Activate Workflow

1. [ ] At the top-right of the workflow editor, find the toggle switch
2. [ ] Click it to turn it **green** (Active)
3. [ ] If it's gray, the workflow won't respond to webhook calls
4. [ ] Verify: Toggle should say **"Active"** and be green

---

## Step 8: Configure Frontend to Use Your Webhook

### Method A: Using Environment Variable (Recommended)

1. [ ] Create file: `.env.local` in project root
2. [ ] Add this line (replace with your webhook URL):
   ```
   REACT_APP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ```
3. [ ] Save the file
4. [ ] Restart dev server: Stop (Ctrl+C) and run `npm start` again

### Method B: Edit Source Code

If .env doesn't work, edit `src/services/api.js`:

```javascript
// Change line 28 from:
const DEFAULT_WEBHOOK_URL = 'https://aahaas-ai.app.n8n.cloud/webhook/...';

// To your webhook URL:
const DEFAULT_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/YOUR-ID';
```

---

## Step 9: Test the Workflow Manually in n8n

Before testing from frontend, test manually in n8n:

1. [ ] In workflow editor, click **"Execute Workflow"** button
2. [ ] Click on **"Webhook"** node
3. [ ] In the right panel, click **"Listen for test event"**
4. [ ] Or manually add test data:
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

5. [ ] To get a real Bearer token for testing:
   - Login to your Travel Quotation app
   - Open DevTools (F12) → Application → Local Storage
   - Copy the value of `authToken`
   - Paste it as `bearerToken` above

6. [ ] Click **"Execute"** or **"Execute Once"**

7. [ ] Check each node:
   - [ ] All nodes should turn **GREEN** (success)
   - [ ] If any node is **RED** (error), click it to see the error
   - [ ] Fix the error and test again

8. [ ] Verify final response:
   - [ ] Check **"Respond to Webhook"** node
   - [ ] Should see output with `quotation_no`, `status`, `message`
   - [ ] Example:
     ```json
     {
       "quotation_no": "12345",
       "status": "success",
       "message": "Your request has been created successfully"
     }
     ```

---

## Step 10: Test from Frontend

1. [ ] Start your React app: `npm start`
2. [ ] Open browser: http://localhost:3000
3. [ ] Login with: john@example.com / secret1
4. [ ] Open DevTools Console (F12) to see logs
5. [ ] Send a test message: "5 days trip to sri lanka"
6. [ ] Check console logs:
   ```
   [WEBHOOK] Bearer Token Present: true
   [WEBHOOK] Bearer Token (first 20 chars): eyJ0eXAiOiJKV1QiLCJh...
   [WEBHOOK] Sending to (n8n): https://your-n8n-instance.com/webhook/...
   ```
7. [ ] Wait 2-3 minutes (AI processing takes time)
8. [ ] Expected result:
   ```
   ✅ Your Request Has Been Created
   Your Request No is 12345
   ```

---

## Step 11: Verify in n8n Execution Logs

1. [ ] In n8n, go to **"Executions"** (left sidebar)
2. [ ] Find the most recent execution (should be from your frontend test)
3. [ ] Click on it to see details
4. [ ] Verify:
   - [ ] Webhook received `chatInput`, `sessionId`, `bearerToken`
   - [ ] All nodes executed successfully (green)
   - [ ] No red (failed) nodes
   - [ ] Response was sent back to webhook

---

## Troubleshooting

### Issue: "OpenAI API Error"
**Cause**: Invalid API key or no credits
**Fix**:
- Check API key is correct
- Verify you have OpenAI credits: https://platform.openai.com/account/usage
- Make sure the model (gpt-4o) is available for your account

### Issue: "Google Sheets - Sheet not found"
**Cause**: Sheet ID is wrong or no access
**Fix**:
- Verify Sheet ID is correct
- Make sure your Google account has edit access to the sheet
- Re-authenticate Google Sheets credential

### Issue: "Authorization failed" in API nodes
**Cause**: Bearer token not configured correctly
**Fix**:
- Verify you added the Authorization header to all 3 nodes
- Check expression is: `=Bearer {{ $('Webhook').first().json.body.bearerToken }}`
- Make sure Authentication is set to "None"
- Verify frontend is sending bearerToken (check console logs)

### Issue: "Empty response" from webhook
**Cause**: Workflow not reaching "Respond to Webhook" node
**Fix**:
- Check n8n execution logs to see which node failed
- Fix the failing node
- Ensure "Respond to Webhook" node is connected in workflow

### Issue: "Cannot connect to backend server"
**Cause**: Backend API is down or URL is wrong
**Fix**:
- Verify backend URL: `https://applev2.appletechlabs.com/api`
- Test manually: `curl https://applev2.appletechlabs.com/api/content/place/?name=Kandy`
- Check if CORS is enabled on backend

---

## Backend API Endpoints Used

The workflow calls these backend endpoints:

1. **Get City Data**:
   ```
   GET /api/content/place/?name={cityName}
   Headers: Authorization: Bearer {token}
   ```

2. **Save Booking**:
   ```
   POST /api/booking/save
   Headers: Authorization: Bearer {token}
   Body: JSON (booking data)
   ```

Make sure these endpoints:
- [ ] Are accessible from your n8n instance
- [ ] Accept Bearer token authentication
- [ ] Return expected JSON format
- [ ] Have CORS enabled if calling from browser

---

## Final Verification Checklist

Before considering setup complete, verify:

- [ ] OpenAI credential configured and working
- [ ] Google Sheets credential configured and working
- [ ] All 3 API nodes use dynamic Bearer token from webhook
- [ ] Workflow is ACTIVE (green toggle)
- [ ] Frontend sends bearerToken in payload (check console)
- [ ] Manual workflow test succeeds (all nodes green)
- [ ] Frontend test succeeds (receives quotation_no)
- [ ] n8n execution logs show successful execution
- [ ] No errors in browser console

---

## Configuration Summary

### Credentials Needed:
1. ✅ OpenAI API - For AI processing
2. ✅ Google Sheets OAuth - For data storage
3. ❌ Bearer Auth (Static) - NOT needed! Using dynamic token from webhook

### Nodes Requiring Bearer Token:
1. Get City ID from API - Uses dynamic token
2. Get City ID from API1 - Uses dynamic token
3. Send to Backend API - Uses dynamic token

### Environment Variables:
```bash
# Frontend (.env.local)
REACT_APP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

---

## Success! 🎉

If all checkboxes are marked and tests pass, your setup is complete!

**What happens now:**
1. User logs in → Gets Bearer token from backend
2. User sends message → Frontend sends to your n8n webhook with token
3. n8n workflow:
   - Uses OpenAI to process the request
   - Uses Bearer token to call backend APIs
   - Gets city data and hotel info
   - Creates booking in backend
   - Saves to Google Sheets
   - Returns quotation_no
4. Frontend displays: "Your Request No is [number]"

Everything works automatically! 🚀

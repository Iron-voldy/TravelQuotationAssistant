# n8n Workflow Debug Checklist

## Current Status
- ✅ Frontend configured correctly and builds successfully
- ✅ Sending correct payload: `{"chatInput":"...","sessionId":"..."}`
- ✅ Webhook URL is correct: `https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147`
- ✅ Backend API is accessible: `https://applev2.appletechlabs.com/api/booking/save`
- ❌ Workflow returns HTTP 200 but empty body (Content-Length: 0)

## Problem Analysis

The curl tests confirm:
1. Webhook IS active (returns HTTP 200, not 404)
2. Workflow IS executing (takes 7-8 seconds, not instant)
3. BUT no response body is returned (Content-Length: 0)

This means: **The workflow is failing somewhere before reaching the "Respond to Webhook" node.**

Since the workflow uses `responseMode: "responseNode"`, if it doesn't reach the "Respond to Webhook" node, NO response body is sent.

## Manual Test Works vs Production Fails

You confirmed the workflow works when tested manually in n8n and returns:
```json
[{
  "body": {
    "quotation_no": 437778,
    "reference_id": 437778,
    "status": 1
  }
}]
```

But production webhook calls return empty. This is typically because:

### 1. Workflow is Inactive
**Check**: Open n8n dashboard → Find workflow "Apple-Quatation-Live" → Check if toggle is GREEN (active)

**Fix**: Click the toggle to activate the workflow

### 2. Credentials Don't Work in Production

Manual testing sometimes uses pinData (cached test data) that bypasses actual API calls. In production, the workflow makes real API calls which may fail.

**Check these nodes in n8n:**

#### A. OpenAI Chat Model (AI Agent node)
- Open "OpenAI Chat Model" node
- Check credentials are set
- Verify OpenAI API key is valid
- Check you have API quota/credits remaining
- Test: Go to https://platform.openai.com/account/usage

#### B. Send to Backend API node
- Open "Send to Backend API" node
- Check "Bearer Auth account" credential is set
- Verify the Bearer token is valid and not expired
- Test: The backend API responded with 401 when we tested without auth, confirming it requires valid Bearer token

#### C. Google Sheets nodes
- Open "Store in Google Sheets" node
- Check "Google Sheets account" credential is set
- Verify Google OAuth is still valid (tokens expire)
- Test: Try accessing the spreadsheet manually

### 3. A Node is Failing

**Check n8n Execution Logs:**

1. Go to n8n dashboard
2. Click "Executions" in left sidebar
3. Look for recent webhook executions
4. Click on the most recent execution
5. Check which node failed (will be marked with RED)
6. Read the error message

Common node failures:

#### If "AI Agent" node fails:
- OpenAI API key invalid
- OpenAI quota exceeded
- Model (gpt-4o) not available
- Request timeout

**Fix**: Check OpenAI credentials and quota

#### If "Code" node fails:
- JavaScript error parsing AI output
- Missing expected fields in AI response

**Fix**: Check the JavaScript code for errors

#### If "Get City ID from API" nodes fail:
- Backend API authentication failed
- City not found in database
- API timeout

**Fix**: Check Bearer token is valid

#### If "Send to Backend API" node fails:
- Bearer token invalid or expired
- Backend API down or slow
- Validation errors on booking data
- Network timeout

**Fix**: Check Bearer token, verify backend API is working

#### If "Store in Google Sheets" node fails:
- Google OAuth token expired
- Spreadsheet not found
- No write permission
- Sheet name doesn't exist

**Fix**: Re-authenticate Google Sheets, check spreadsheet ID and permissions

### 4. Workflow Execution Times Out

n8n has a default execution timeout (usually 120 seconds). If the workflow takes longer, it times out and fails silently.

**Check**: Look at execution logs to see if executions are marked as "timeout"

**Fix**: Increase workflow timeout in n8n settings, or optimize slow nodes

## Immediate Action Steps

### Step 1: Verify Workflow is Active
```
1. Open https://aahaas-ai.app.n8n.cloud
2. Login to your n8n account
3. Find the workflow with webhook ID: 085ddfb8-f53a-456e-b662-85de50da8147
4. Check if the toggle at top-right is GREEN (active)
5. If it's gray (inactive), click it to activate
```

### Step 2: Check Recent Executions
```
1. Click "Executions" in left sidebar
2. Look for executions from the last 10 minutes
3. You should see entries when you send messages from the frontend
4. Click on an execution to see details
```

### Step 3: Identify Failed Node
```
If executions appear:
1. Click on the most recent execution
2. Look for nodes marked with red color (failed)
3. Click on the failed node
4. Read the error message
5. Fix the issue based on error message

If NO executions appear:
1. The workflow is inactive - activate it
2. OR the webhook URL is wrong - verify it matches
```

### Step 4: Check All Credentials
```
1. Go to workflow editor
2. Click on "OpenAI Chat Model" node → Check credentials
3. Click on "Send to Backend API" node → Check "Bearer Auth" credential
4. Click on "Store in Google Sheets" node → Check "Google Sheets" credential
5. For each credential, click "Test" or re-authenticate if needed
```

### Step 5: Test Manually in n8n
```
1. Open workflow in editor
2. Click "Execute Workflow" button
3. Manually input test data in "Webhook" node:
   {
     "body": {
       "chatInput": "3 days trip to sri lanka",
       "sessionId": "test_123"
     }
   }
4. Watch the workflow execute
5. Check which nodes succeed (green) and which fail (red)
6. Fix any failed nodes
```

## Test from Frontend

Once you've fixed the n8n workflow, test from the frontend:

1. Open the Travel Quotation Assistant app
2. Login with your credentials
3. Type a message: "6 days trip to sri lanka for 5 people"
4. Click send
5. Wait 2-3 minutes (n8n can take time)
6. You should see: "Your Request No is [quotation_no]"

## If Still Not Working

If you've checked everything above and it still doesn't work:

1. **Check n8n console logs** for server-side errors
2. **Verify the webhook URL hasn't changed** in n8n settings
3. **Try creating a new webhook** and update the frontend URL
4. **Simplify the workflow** - remove complex nodes temporarily to isolate the issue
5. **Contact n8n support** with execution IDs of failed runs

## Frontend is Ready

The frontend code is already correctly configured and ready to:
- Send the correct payload format
- Wait indefinitely for n8n response (no timeout)
- Extract and display the quotation_no
- Show appropriate error messages

As soon as the n8n workflow starts working, the frontend will automatically work too.

---

**Next Step**: Open n8n dashboard and follow Step 1 above to verify the workflow is active.

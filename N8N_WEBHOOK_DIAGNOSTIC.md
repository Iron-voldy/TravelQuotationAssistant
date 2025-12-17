# n8n Webhook Diagnostic Report

## Issue Summary
The Travel Quotation Assistant frontend is successfully sending requests to the n8n webhook, but the webhook is returning empty responses (HTTP 200 with no body).

## What Was Fixed on Frontend

### 1. Fixed Critical Syntax Error in `src/services/api.js`
- **Problem**: The entire file content was incorrectly nested inside the `assistantAPI.sendMessage` payload object
- **Solution**: Restructured the file with proper exports and function definitions
- **Result**: Build now compiles successfully ✅

### 2. Added Webhook Timeout Handling
- **Problem**: No timeout for webhook requests, causing indefinite hangs
- **Solution**: Added 60-second timeout with AbortController
- **Result**: Requests now fail gracefully after 60 seconds ✅

### 3. Improved Error Messages
- **Problem**: Generic error messages didn't help identify the issue
- **Solution**: Added detailed error messages explaining possible causes
- **Result**: Users now get clear guidance on what might be wrong ✅

## What Needs to Be Fixed on n8n Side

### Current Webhook Behavior
```
Request sent to: https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147

Payload: {
  "chatInput": "6 days trip to sri lanka for 5 peoples",
  "input": "6 days trip to sri lanka for 5 peoples",
  "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "action": "sendMessage",
  "chatId": "chat_1765959904968"
}

Response: HTTP 200 OK
Content-Type: application/json; charset=utf-8
Body: (EMPTY - 0 bytes)
```

### Expected Webhook Response
The workflow should return a response like:
```json
{
  "quotation_no": "12345",
  "status": "success",
  "message": "Quotation created successfully",
  "reference_id": "12345"
}
```

## n8n Workflow Checklist

Please verify the following in your n8n workflow:

### 1. Check Workflow Execution Status
- [ ] Open n8n dashboard
- [ ] Go to "Executions" tab
- [ ] Look for executions of webhook `085ddfb8-f53a-456e-b662-85de50da8147`
- [ ] Check if executions are:
  - ✅ Completing successfully
  - ❌ Failing with errors
  - ⏱️ Timing out
  - ⚠️ Not appearing at all (webhook not triggered)

### 2. Check "Respond to Webhook" Node
The workflow has a node called "Respond to Webhook" that should send the final response.

Verify:
- [ ] The workflow execution reaches the "Respond to Webhook" node
- [ ] The node has data to respond with (check `$json` in the node)
- [ ] The node is properly configured:
  - Response Mode: JSON
  - Response Body: `={{ $json }}`

### 3. Check "Prepare Response" Node
This node (before "Respond to Webhook") should format the final response.

Verify:
- [ ] The node executes successfully
- [ ] It outputs a JSON object with required fields
- [ ] Check the node's output data in execution logs

### 4. Check Workflow Path
The workflow has two paths based on "Is Update Request?" condition:
- **Update Path**: AI Agent1 → Parse Update Request → ...
- **Create Path**: AI Agent → Code → Split Out Places → ... → Store in Google Sheets → Prepare Response → Respond to Webhook

For "6 days trip to sri lanka for 5 peoples":
- [ ] It should follow the **Create Path** (not update)
- [ ] Verify each node in the path executes successfully
- [ ] Look for errors in:
  - AI Agent (OpenAI call)
  - Code node (parsing AI output)
  - Google Sheets lookup nodes
  - Store in Google Sheets node

### 5. Common n8n Issues to Check

#### A. OpenAI API Credentials
- [ ] Check if OpenAI API credentials are valid
- [ ] Check if you have API credits/quota remaining
- [ ] Look for errors like "API key invalid" or "Quota exceeded"

#### B. Google Sheets Access
- [ ] Verify Google Sheets credentials are valid
- [ ] Check if the spreadsheet exists and is accessible
- [ ] Spreadsheet ID in workflow: `1n-xL0h9PHeOhfcpytCouV7_pkYj4BzSMZghqTsKrgYo`
- [ ] Sheet name: `Sheet8`

#### C. Workflow Timeout
- [ ] Check if workflow has a timeout setting
- [ ] Default n8n timeout is 120 seconds
- [ ] If workflow takes > 120s, it will timeout silently

#### D. Error Handling
- [ ] Check if there's an error path in the workflow
- [ ] Verify error responses are being sent back to webhook

## How to Debug in n8n

### Step 1: Check Recent Executions
1. Open n8n dashboard
2. Click "Executions" in left sidebar
3. Look for recent webhook executions
4. Click on an execution to see detailed logs

### Step 2: Test Workflow Manually
1. Open the workflow in n8n editor
2. Click "Execute Workflow" button
3. Manually input test data:
   ```json
   {
     "body": {
       "chatInput": "6 days trip to sri lanka for 5 peoples",
       "sessionId": "test_session_123",
       "action": "sendMessage",
       "chatId": "test_chat_123"
     }
   }
   ```
4. Watch which nodes execute and which fail
5. Check each node's output data

### Step 3: Enable Webhook Debug Logging
1. In the "Webhook" node settings
2. Enable "Options" → "Response Code" → 200
3. Add error handling to catch failures

### Step 4: Check "Prepare Response" Code
The "Prepare Response" node should format data like this (example):
```javascript
// Get data from previous node
const data = $input.first().json;

return {
  json: {
    quotation_no: data.quotation_no || data.id || "UNKNOWN",
    status: "success",
    message: "Quotation created successfully",
    reference_id: data.quotation_no || data.id
  }
};
```

## Frontend Changes Made

### Updated Files
1. **src/services/api.js**
   - Fixed syntax error (file structure was completely broken)
   - Added timeout handling (60 seconds)
   - Improved error messages
   - Added proper error logging

### What Frontend Now Does
1. Sends request to primary webhook with 60s timeout
2. If fails/empty, tries legacy webhook
3. If both fail, shows detailed error message
4. Logs all requests/responses for debugging

### Error Messages Users See
If webhook fails:
```
The AI assistant is temporarily unavailable. This could be due to:

1. The n8n workflow is not responding (check n8n execution logs)
2. The workflow execution is timing out (> 60 seconds)
3. The webhook URL may have changed

Please check the n8n workflow status and logs.
```

## Testing the Webhook

### Test with curl
```bash
curl -X POST https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147 \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "6 days trip to sri lanka for 5 peoples",
    "sessionId": "test_123",
    "action": "sendMessage",
    "chatId": "test_chat"
  }'
```

Expected response:
```json
{
  "quotation_no": "12345",
  "status": "success",
  "message": "...",
  "reference_id": "12345"
}
```

Current response:
```
(empty - no data returned)
```

## Next Steps

1. **Check n8n workflow executions** to see if workflow is running
2. **Identify which node is failing** by examining execution logs
3. **Fix the failing node** (likely OpenAI, Google Sheets, or response formatting)
4. **Test the workflow** manually in n8n editor
5. **Test from frontend** once workflow returns proper responses

## Contact Information

If you need help debugging the n8n workflow:
- Check n8n community forum: https://community.n8n.io
- Review n8n docs: https://docs.n8n.io
- Look for similar issues with "Respond to Webhook" node

---

**Status**:
- ✅ Frontend build fixed
- ✅ Frontend timeout handling added
- ✅ Frontend error messages improved
- ❌ n8n webhook returning empty responses (needs investigation)

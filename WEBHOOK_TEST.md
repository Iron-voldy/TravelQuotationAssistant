# Webhook Testing Guide

## 🧪 Test Webhook with Postman

### 1. Postman Request Setup

**Method:** `POST`

**URL:**
```
https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "chatInput": "I need a trip to Paris for 2 people, 5 days",
  "sessionId": "test_session_123"
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
```bash
curl -X POST "https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147" \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "I need a trip to Paris for 2 people, 5 days",
    "sessionId": "test_session_123"
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

**Test 1: Simple request**
```json
{
  "chatInput": "Paris trip for 2 people",
  "sessionId": "test_1"
}
```

**Test 2: Detailed request**
```json
{
  "chatInput": "I want to visit Tokyo, Japan for 10 days. 4 people, budget $5000",
  "sessionId": "test_2"
}
```

**Test 3: Invalid request (to see error handling)**
```json
{
  "chatInput": "",
  "sessionId": "test_3"
}
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

## 🔧 Alternative Webhook (if main one doesn't work)

I noticed in your HTML file, there's a different webhook URL:
```
https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342
```

**Try this one too if the first doesn't work!**

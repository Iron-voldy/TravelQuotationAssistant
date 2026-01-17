# How to Fix n8n Bearer Authentication Issue

## Problem Identified ✅

Three nodes in your n8n workflow are failing due to missing/invalid Bearer token:
1. **Get City ID from API** - calls `/api/content/place/`
2. **Get City ID from API1** - calls `/api/content/place/`
3. **Send to Backend API** - calls `/api/booking/save`

All three use the same Bearer auth credential: `Bearer Auth account` (ID: rV15rVRfnenmkroQ)

## Solution: Update Bearer Token in n8n

### Method 1: Using the HTML Tool (Easiest)

1. Open `get_bearer_token.html` in your browser (double-click the file)
2. Enter your backend admin email and password
3. Click "Get Bearer Token"
4. Copy the token shown
5. Follow the instructions to add it to n8n (shown below)

### Method 2: Manual Login via Browser Console

1. Login to your Travel Quotation Assistant app normally
2. Open browser DevTools (F12)
3. Go to "Application" tab → "Local Storage"
4. Find and copy the value of `authToken`
5. Use this token in n8n (shown below)

### Method 3: Using curl Command

Run this command with your admin credentials:

```bash
curl -X POST "https://applev2.appletechlabs.com/api/auth/login" \
  -H "Accept: application/json" \
  -F "email=YOUR_ADMIN_EMAIL" \
  -F "password=YOUR_ADMIN_PASSWORD"
```

Copy the `token` value from the response.

---

## Adding Token to n8n Credentials

Once you have the Bearer token, follow these steps:

### Step 1: Open n8n Dashboard
1. Go to https://aahaas-ai.app.n8n.cloud
2. Login to your n8n account

### Step 2: Go to Credentials Settings
1. Click on your **profile icon** in the top-right corner
2. Select **"Settings"**
3. Click on **"Credentials"** in the left sidebar

### Step 3: Find or Create Bearer Auth Credential

#### If "Bearer Auth account" exists:
1. Search for "Bearer Auth account" in the credentials list
2. Click on it to edit
3. In the "Token" field, paste your Bearer token
4. Click **"Save"**

#### If it doesn't exist:
1. Click **"+ Add Credential"**
2. Search for "Bearer Auth"
3. Select **"Bearer Auth"** from the list
4. Enter a name: `Bearer Auth account`
5. In the "Token" field, paste your Bearer token
6. Click **"Save"**
7. Note down the credential name

### Step 4: Update Workflow Nodes (if you created new credential)

If you created a new credential with a different name, you need to update the nodes:

1. Open your workflow in n8n editor
2. Click on **"Get City ID from API"** node
3. Under "Authentication", select your new credential
4. Repeat for **"Get City ID from API1"** node
5. Repeat for **"Send to Backend API"** node
6. Click **"Save"** on the workflow

### Step 5: Test the Workflow

1. In the workflow editor, click **"Execute Workflow"**
2. Manually input test data:
   ```json
   {
     "body": {
       "chatInput": "3 days trip to sri lanka",
       "sessionId": "test_123"
     }
   }
   ```
3. Watch the nodes execute
4. All three nodes should now show **GREEN** (success)
5. Check if you get a quotation_no in the response

### Step 6: Test from Frontend

1. Open your Travel Quotation Assistant app
2. Login with your user account
3. Type: "5 days trip to sri lanka"
4. Send the message
5. Wait 2-3 minutes
6. You should see: "Your Request No is [quotation_no]"

---

## Important Notes

### Token Expiration
- Bearer tokens usually expire after some time (e.g., 24 hours, 7 days)
- If the workflow stops working again, you need to get a new token
- Consider creating a **service account** or **API key** that doesn't expire

### Security
- Never share your Bearer token publicly
- Store it securely in n8n credentials only
- Don't hardcode it in the workflow

### Creating a Non-Expiring Token

For production use, you should create a service account token that doesn't expire:

1. Login to your backend admin panel
2. Go to API Keys or Service Accounts section
3. Create a new API key with permissions:
   - Read access to `/api/content/place/`
   - Write access to `/api/booking/save`
4. Use this API key as the Bearer token in n8n

---

## Verification Checklist

After updating the Bearer token, verify:

- [ ] Token added to n8n "Bearer Auth account" credential
- [ ] All three nodes (Get City ID from API, Get City ID from API1, Send to Backend API) use the credential
- [ ] Manual workflow test succeeds
- [ ] All nodes show green (no red errors)
- [ ] Response includes quotation_no
- [ ] Frontend test succeeds
- [ ] User receives "Your Request No is [number]" message

---

## Troubleshooting

### If nodes still show "Authorization failed":
- Token might be incorrect - verify you copied it completely
- Token might have expired - get a fresh token
- Account might not have necessary permissions

### If nodes succeed but return "City not found":
- The city name in the request might not exist in your database
- Check your backend database has city data

### If "Send to Backend API" fails:
- Token might not have permission for `/api/booking/save`
- Check the booking data format is correct
- Verify backend API is working

---

## Next Steps

1. **Get Bearer Token** - Use `get_bearer_token.html` or manual method
2. **Add to n8n** - Follow steps above
3. **Test Workflow** - Verify all nodes work
4. **Test Frontend** - Send a test message
5. **Monitor** - Check if token expires and needs renewal

Once the Bearer token is configured correctly, your workflow will work and return the quotation_no to the frontend! 🎉

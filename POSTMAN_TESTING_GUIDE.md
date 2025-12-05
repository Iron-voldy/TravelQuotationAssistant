# Travel Quotation Assistant - Postman API Testing Guide

## Overview
This guide explains how to use the Postman collection to test the Travel Quotation Assistant backend API. The collection includes all necessary endpoints for authentication, chat messaging, booking management, quotations, and content APIs.

---

## Setup Instructions

### 1. Import the Collection
1. Open **Postman**
2. Click **Import** (top-left corner)
3. Select the file: `Travel_Quotation_Assistant_Postman.postman_collection.json`
4. Click **Import**

### 2. Environment Variables
The collection uses environment variables that are automatically populated:
- `baseUrl`: API base URL (http://localhost:8011/proxy/api)
- `authToken`: Automatically set after login
- `quotationNo`: Automatically set after sending a chat message
- `referenceId`: Automatically set after sending a chat message

---

## API Testing Workflow

### Step 1: Authentication (Required First)

#### Request: **Login**
```
Method: POST
URL: {{baseUrl}}/auth/login
```

**Headers:**
```
Accept: application/json
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
email: test@example.com
password: password123
```

**Expected Response (200 OK):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com"
    }
}
```

**Note:** The `access_token` is automatically saved to the `authToken` environment variable.

---

#### Request: **Register (Optional)**
```
Method: POST
URL: {{baseUrl}}/auth/register
```

**Headers:**
```
Accept: application/json
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
name: John Doe
email: newuser@example.com
password: password123
password_confirmation: password123
```

---

### Step 2: Send Chat Message (Main Feature)

#### Request: **Send Chat Message**
```
Method: POST
URL: https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "chatInput": "I need a 7-day trip to Japan for 2 people in March 2025. Budget around $3000 per person.",
    "sessionId": "session_1234567890_abcdefg"
}
```

**Expected Response (200 OK):**
```json
{
    "quotation_no": "QT-2025-001234",
    "reference_id": "REF-2025-001234",
    "output": "Your Request Has Been Created\n\nYour Request No is QT-2025-001234\n\nOur team will review your travel request and send you a detailed quote shortly. Thank you for choosing our services."
}
```

**Important Notes:**
- `sessionId` should be unique per user session
- The `quotation_no` is automatically saved to environment variable
- This endpoint does NOT require authentication (no Bearer token needed)

---

#### Sample Chat Requests

**Example 1: Luxury Honeymoon**
```json
{
    "chatInput": "I'm looking for a luxury 10-day honeymoon package to Maldives and Bali for 2 people. We prefer 5-star hotels, international flights, and daily spa sessions. Our budget is around $10,000 per person. We want to travel in June 2025.",
    "sessionId": "session_honeymoon_june2025"
}
```

**Example 2: Budget Travel**
```json
{
    "chatInput": "Looking for a budget-friendly 5-day trip to Southeast Asia (Thailand/Vietnam) for 3 people. Budget is $1000 total. We prefer hostels/budget hotels and street food. Travel dates flexible.",
    "sessionId": "session_budget_asia_2025"
}
```

---

### Step 3: Save Booking

#### Request: **Save Booking**
```
Method: POST
URL: {{baseUrl}}/booking/save
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
Accept: application/json
```

**Body (JSON):**
```json
{
    "quotation_no": "{{quotationNo}}",
    "reference_id": "{{referenceId}}",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "destination": "Japan",
    "travel_dates": "2025-03-01 to 2025-03-07",
    "number_of_travelers": 2,
    "total_budget": 6000,
    "accommodation_type": "Hotel",
    "booking_status": "pending"
}
```

**Expected Response (200 OK):**
```json
{
    "id": 1,
    "quotation_no": "QT-2025-001234",
    "reference_id": "REF-2025-001234",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "booking_status": "pending",
    "created_at": "2025-03-01T10:00:00Z"
}
```

---

### Step 4: Retrieve Booking

#### Request: **Retrieve Booking**
```
Method: POST
URL: {{baseUrl}}/booking/retrieve
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
Accept: application/json
```

**Body (JSON):**
```json
{
    "quotation_no": "{{quotationNo}}",
    "reference_id": "{{referenceId}}"
}
```

---

### Step 5: List Quotations

#### Request: **List Quotations**
```
Method: GET
URL: {{baseUrl}}/quotation/list?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Accept: application/json
```

**Query Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| page | 1 | Page number |
| limit | 10 | Items per page |

**Expected Response (200 OK):**
```json
{
    "data": [
        {
            "id": 1,
            "quotation_no": "QT-2025-001234",
            "customer_name": "John Doe",
            "destination": "Japan",
            "total_budget": 6000,
            "created_at": "2025-03-01T10:00:00Z"
        }
    ],
    "total": 1,
    "page": 1,
    "per_page": 10
}
```

---

### Step 6: View Quotation PNL

#### Request: **View Quotation PNL**
```
Method: GET
URL: {{baseUrl}}/quotation/view/pnl?reference_id={{referenceId}}&quotation_no={{quotationNo}}&currency=USD
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Accept: application/json
```

**Query Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| reference_id | {{referenceId}} | Reference ID from quotation |
| quotation_no | {{quotationNo}} | Quotation number |
| currency | USD | Currency code |

---

### Step 7: Search Places

#### Request: **Get Places**
```
Method: GET
URL: {{baseUrl}}/content/place/?search=Japan&limit=10
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Accept: application/json
```

**Query Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| search | Japan | Destination name |
| limit | 10 | Max results |

---

### Step 8: Search Hotels

#### Request: **Get Hotels**
```
Method: GET
URL: {{baseUrl}}/content/hotel?city=Tokyo&stars=4&limit=10
```

**Headers:**
```
Authorization: Bearer {{authToken}}
Accept: application/json
```

**Query Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| city | Tokyo | City name |
| stars | 4 | Star rating (1-5) |
| limit | 10 | Max results |

---

## Complete Testing Workflow

### Recommended Order:
1. **Login** → Get auth token
2. **Send Chat Message** → Get quotation number
3. **Save Booking** → Save the quotation
4. **List Quotations** → Verify booking was saved
5. **Retrieve Booking** → Get saved booking details
6. **View PNL** → Analyze profit/loss
7. **Search Places** → Find destination details
8. **Search Hotels** → Find accommodation options

---

## Environment Variables Reference

| Variable | Value | Set By | Usage |
|----------|-------|--------|-------|
| baseUrl | http://localhost:8011/proxy/api | Manual | Base URL for all authenticated requests |
| authToken | (auto-populated) | Login request | Authorization header for protected endpoints |
| userId | (auto-populated) | Login request | User identifier |
| userName | (auto-populated) | Login request | User name |
| quotationNo | (auto-populated) | Chat message | Identify specific quotation |
| referenceId | (auto-populated) | Chat message | Reference ID for quotation |

---

## Important Notes

### CORS Proxy Requirement
- The backend must be accessed through a CORS proxy
- Start the proxy with: `start-cors-proxy.bat`
- If the proxy is not running, you'll get CORS errors

### Authentication
- Most endpoints require `Authorization: Bearer {{authToken}}`
- The auth token is obtained from the Login endpoint
- The token automatically expires after 1 hour

### Session ID
- Each chat message should use a unique `sessionId`
- Keep the same `sessionId` for messages in the same conversation
- Example format: `session_1234567890_abcdefg`

### Chat Input Guidelines
- Provide detailed travel information
- Include: destination, duration, number of travelers, budget, date preferences
- The AI assistant processes the request and returns a quotation number

### Error Handling
| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 200 | Success | Request processed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request body and parameters |
| 401 | Unauthorized | Login again to get fresh token |
| 422 | Validation Error | Check required fields in body |
| 500 | Server Error | Backend server error |

---

## Quick Test Checklist

- [ ] Import Postman collection
- [ ] Login and verify auth token is set
- [ ] Send chat message and verify quotation number is returned
- [ ] Save booking using quotation number
- [ ] Retrieve booking using quotation number
- [ ] List all quotations
- [ ] View quotation PNL
- [ ] Search for places
- [ ] Search for hotels

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors
**Solution:** Start the CORS proxy by running `start-cors-proxy.bat`

### Issue: 401 Unauthorized
**Solution:** Login again and verify the auth token is correctly set in environment variables

### Issue: 422 Validation Error
**Solution:** Check all required fields are included in request body

### Issue: Empty response from chat endpoint
**Solution:** Verify the webhook URL is correct and n8n workflow is active

### Issue: Variables not auto-populating
**Solution:** Check the Tests tab in Postman - scripts may need to be enabled

---

## Additional Resources

- **Postman Documentation:** https://learning.postman.com/
- **API Response Examples:** See each endpoint description
- **Environment Variables:** Click gear icon in Postman to manage variables

---

## Support & Testing Tips

1. **Test in order** - Follow the recommended workflow
2. **Check environment** - Verify all variables are set correctly
3. **Monitor console** - Check Postman console for detailed logs
4. **Save responses** - Use "Save as example" for reference
5. **Use tests** - Enable pre-request and test scripts for validation

---

Created for: Travel Quotation Assistant Project
Last Updated: December 5, 2025

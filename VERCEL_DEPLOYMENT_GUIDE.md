# CORS Proxy Removal - Direct Backend Connection Setup

## Changes Made

The application has been updated to connect directly to the backend without requiring a CORS proxy. This allows the app to run on any machine (including Vercel) without needing to run `start-cors-proxy.bat`.

### Updated Files

1. **src/services/api.js**
   - Changed from: `http://localhost:8011/proxy/api`
   - Changed to: `https://stagev2.appletechlabs.com/api`
   - Now uses `process.env.REACT_APP_API_URL` for environment-specific configuration

2. **src/context/AuthContext.js**
   - Token refresh endpoint now uses environment variable
   - Updated to: `${API_BASE_URL}/auth/refresh`

3. **.env.local** (New)
   - Local development environment configuration
   - Do not commit to version control

4. **.env.production** (New)
   - Production environment configuration (Vercel)
   - Do not commit to version control

## Local Development

### No More CORS Proxy Needed!

Simply run:
```bash
npm install
npm start
```

That's it! You no longer need to run `start-cors-proxy.bat`.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Remove CORS proxy - direct backend connection"
git push
```

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Create React App project

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables:

```
REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

### Step 4: Deploy

Click "Deploy" and Vercel will automatically:
- Install dependencies
- Build the React app
- Deploy to production

## API Endpoints Configuration

All API calls now go directly to the backend:

- **Base URL**: `https://stagev2.appletechlabs.com/api`
- **Authentication**: Bearer token in Authorization header
- **CORS**: Enabled on backend

### Available Endpoints (from Postman collection)

**Authentication:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

**Quotation:**
- `GET /quotation/list` - List quotations
- `GET /quotation/view/pnl` - View PNL data

**Booking:**
- `POST /booking/save` - Save booking
- `POST /booking/retrieve` - Retrieve booking

**Content:**
- `GET /content/place/` - Get places
- `GET /content/hotel` - Get hotels
- And more...

## CORS Considerations

The backend at `https://stagev2.appletechlabs.com` must have CORS enabled to accept requests from:
- `http://localhost:3000` (local development)
- `https://<your-vercel-domain>.vercel.app` (production)

If you encounter CORS errors, contact the backend team to ensure:
1. CORS headers are enabled
2. Your domain is whitelisted in CORS configuration
3. Credentials mode is properly configured

## Troubleshooting

### Still seeing "Cannot connect to server" error?

1. **Check internet connection**: Ensure you're connected to the internet
2. **Verify backend is running**: Try accessing `https://stagev2.appletechlabs.com/api/auth/me` in browser
3. **Check browser console**: Look for specific error messages in DevTools
4. **Verify environment variables**: Ensure `.env.local` is properly loaded

### The app loads but authentication fails?

1. Check backend status: All auth endpoints at `https://stagev2.appletechlabs.com/api/auth/*`
2. Verify credentials are correct
3. Check browser console for detailed error messages

## Deployment to Other Platforms

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add Environment Variables in Netlify Settings:
   - `REACT_APP_API_URL=https://stagev2.appletechlabs.com/api`
   - `REACT_APP_WEBHOOK_URL=...`

### AWS Amplify

1. Connect GitHub repository
2. Set environment variables before deployment
3. Amplify auto-detects React app configuration

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
RUN npm run build
CMD ["npm", "start"]
```

## Security Notes

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **API keys in URLs** - Don't expose sensitive data in query parameters
3. **HTTPS only** - Backend URL is HTTPS, all secure
4. **Token storage** - Using localStorage for now, consider upgrading to secure HTTP-only cookies for production

## Next Steps

1. Test locally: `npm start`
2. Test all authentication flows
3. Push to GitHub
4. Deploy to Vercel
5. Test production deployment
6. Monitor for any CORS or connectivity issues

## Support

For issues or questions:
1. Check browser console for error messages
2. Review Postman collection for API specs
3. Check backend logs for server-side errors
4. Verify environment variables are set correctly

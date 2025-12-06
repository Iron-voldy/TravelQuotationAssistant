# Quick Start Guide - No CORS Proxy Needed! 🚀

## Before You Start

**Important**: You no longer need to run `start-cors-proxy.bat`. The application now connects directly to the backend.

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env.local` file in the root directory:

```env
REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
```

### 3. Start the Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## Testing Locally

1. **Login Page**: `http://localhost:3000/login`
2. **Register Page**: `http://localhost:3000/register`
3. **Travel Assistant**: `http://localhost:3000/assistant` (requires authentication)

### Test Credentials
Use any valid credentials that exist on the backend at:
`https://stagev2.appletechlabs.com`

## Deploy to Vercel

### Quick Deploy in 3 Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Vercel auto-configures React apps

3. **Set Environment Variables**
   - In Project Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
     REACT_APP_WEBHOOK_URL=https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147
     ```
   - Click Deploy

That's it! Your app is live on Vercel! 🎉

## Key Changes

### What Was Removed
- ❌ `start-cors-proxy.bat` (no longer needed)
- ❌ CORS proxy server requirement
- ❌ Port 8011 dependency

### What Changed
- ✅ Direct connection to `https://stagev2.appletechlabs.com/api`
- ✅ Works on any machine without setup
- ✅ Ready for production deployment
- ✅ No local proxy needed

## Troubleshooting

### Getting "Cannot connect to server" error?

**Solution**:
1. Check your internet connection
2. Verify `.env.local` exists and has correct URL
3. Restart the development server: `npm start`
4. Clear browser cache and cookies

### Authentication not working?

**Check**:
1. Backend is online: Visit https://stagev2.appletechlabs.com/api/auth/me in browser
2. Credentials are correct
3. Check browser console for detailed errors

### Environment variables not loading?

**Solution**:
1. Ensure `.env.local` is in root directory
2. Restart `npm start`
3. Verify naming: Must start with `REACT_APP_`

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (not reversible!)
npm run eject
```

## API Endpoints

All requests go directly to: `https://stagev2.appletechlabs.com/api`

**Authentication Endpoints:**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

**Other Endpoints:**
- See `VERCEL_DEPLOYMENT_GUIDE.md` for complete list

## Project Structure

```
Travel_Quotation_Assistant/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── context/
│   │   └── AuthContext.js        # Auth state management
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── TravelQuotationPage.jsx
│   ├── services/
│   │   └── api.js                # API calls (now without CORS proxy)
│   └── index.js
├── .env.local                     # Local environment variables
├── .env.production                # Production variables
├── package.json
└── README.md
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Create `.env.local`
3. ✅ Test locally with `npm start`
4. ✅ Deploy to Vercel
5. ✅ Share your app with others!

## Support & Documentation

- **Deployment Details**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **API Reference**: See `POSTMAN_TESTING_GUIDE.md`
- **Backend API**: `https://stagev2.appletechlabs.com`
- **Postman Collection**: `Travel_Quotation_Assistant_Postman.postman_collection.json`

---

**Happy Coding! 🚀** Your app is now production-ready and can be deployed anywhere!

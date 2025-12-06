# Travel Quotation Assistant

AI-powered Travel Quotation Assistant with authentication and real-time chat support.

## Live Demo

**Production URL**: https://travel-quotation-assistant.vercel.app

## Deployment to Vercel

This project is configured for automatic deployment to Vercel.

### Environment Configuration

Environment variables are configured in `vercel.json` for automatic deployment:
- `REACT_APP_API_URL`: https://stagev2.appletechlabs.com/api
- `REACT_APP_WEBHOOK_URL`: AI webhook endpoint

**No manual configuration needed!** Just push to GitHub and Vercel will auto-deploy.

### Deployment Status

The project will automatically redeploy when you push to the `main` branch. Vercel typically takes 2-3 minutes to build and deploy.

### Troubleshooting Vercel Deployment

If you see "Cannot connect to server" errors after deployment:

1. **Wait for deployment to complete** - Check Vercel dashboard for build status
2. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Vercel logs** - View build logs in Vercel dashboard
4. **Verify environment variables** - Ensure `vercel.json` has correct API URL

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

3. Start development server:
   ```bash
   npm start
   ```

The app will run at http://localhost:3000

## Build for Production

```bash
npm run build
```

The production build will be created in the `build` folder.

## Features

- User Authentication (Login/Register)
- AI Travel Assistant Chatbot
- Quotation Management
- Real-time Chat Interface
- Responsive Design

## Tech Stack

- React 18
- React Router v6
- Create React App
- Backend API: Laravel (https://stagev2.appletechlabs.com)

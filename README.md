# Travel Quotation Assistant

AI-powered Travel Quotation Assistant with authentication and real-time chat support.

## Deployment to Vercel

This project is configured for automatic deployment to Vercel:

### Quick Deploy

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect the configuration from `vercel.json`
4. Deploy!

The environment variables are already configured in `vercel.json`:
- `REACT_APP_API_URL`: https://stagev2.appletechlabs.com/api
- `REACT_APP_WEBHOOK_URL`: Your webhook endpoint

### Manual Environment Setup (if needed)

If you need to override environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:
   - `REACT_APP_API_URL`
   - `REACT_APP_WEBHOOK_URL`

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

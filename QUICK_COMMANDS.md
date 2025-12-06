# 🚀 QUICK COMMANDS - Get Started Now!

## For Windows (PowerShell or CMD)

### Simple - Just Run
```bash
npm start
```

### With Network Access
```bash
set HOST=0.0.0.0
npm start
```

Then open: `http://192.16.26.167:3000`

### Complete Fresh Install
```bash
npm install
npm start
```

### Batch File (Double-click)
```
start-local-dev.bat
```

## For macOS/Linux

### Simple - Just Run
```bash
npm start
```

### With Network Access
```bash
export HOST=0.0.0.0
npm start
```

Then open: `http://192.16.26.167:3000`

### Shell Script
```bash
chmod +x start-local-dev.sh
./start-local-dev.sh
```

## Access URLs

### Local Machine
```
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/assistant
```

### From Network
```
http://192.16.26.167:3000/login
http://192.16.26.167:3000/register
http://192.16.26.167:3000/assistant
```

## Troubleshooting Commands

### Clear Cache and Reinstall
```bash
npm cache clean --force
Remove-Item -Path "node_modules", "package-lock.json" -Force -Recurse
npm install
npm start
```

### Check if Port 3000 is Free
```bash
netstat -ano | findstr :3000
```

### Use Different Port
```bash
set PORT=3001
npm start
```

### Clear React Cache
```bash
Remove-Item -Path ".eslintcache", "node_modules/.cache" -Force -Recurse
npm start
```

## Environment Variables

### Use Direct Backend (if CORS works)
```bash
set REACT_APP_API_URL=https://stagev2.appletechlabs.com/api
npm start
```

### Use Custom Backend
```bash
set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

## Verify Setup

### Check Dependencies
```bash
npm list http-proxy-middleware
```

### Check Files Exist
```bash
dir src/setupProxy.js
type src/setupProxy.js
```

### View Configuration
```bash
type .env.local
```

## Common Issues & Fixes

### "npm not found"
→ Install Node.js: https://nodejs.org/

### "Cannot find module http-proxy-middleware"
→ Run: `npm install`

### "Port 3000 already in use"
→ Use different port: `set PORT=3001` then `npm start`

### "Backend connection error"
→ Verify: Check console (F12) for [API CONFIG] messages
→ Try: Clear cache and restart

### "Cannot connect from network IP"
→ Use: `set HOST=0.0.0.0` before starting

## Testing

### 1. Start Server
```bash
npm start
```

### 2. Open Browser
```
http://localhost:3000/login
```

### 3. Try Login
- Email: test@example.com
- Password: any password

### 4. Check Console (F12)
- Should see: [API CONFIG] Base URL: /api
- No CORS errors should appear

### 5. Check Success
- Login page should load
- No red errors in console
- Network requests should go through

## Build Commands

### Production Build
```bash
npm run build
```

### Production Preview (local)
```bash
npm install -g serve
serve -s build
```

## Deployment

### To Vercel
```bash
npm install -g vercel
vercel
```

### To Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Still Having Issues?

1. Read: `LOCAL_DEVELOPMENT_SETUP.md`
2. Read: `CORS_SOLUTION_TECHNICAL_SUMMARY.md`
3. Check: Browser console (F12)
4. Check: Node console for [API] logs
5. Check: `https://stagev2.appletechlabs.com/api` is online

## Summary

```
npm install    # Install once
npm start      # Run development
http://localhost:3000  # Open browser
```

That's it! 🎉

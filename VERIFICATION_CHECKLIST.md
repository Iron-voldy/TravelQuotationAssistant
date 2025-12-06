# ✅ CORS Fix - Verification Checklist

## Installation Verification

- [ ] `npm install` completed successfully
- [ ] `node_modules/http-proxy-middleware` exists
- [ ] No npm errors or warnings
- [ ] `package-lock.json` updated

## File Verification

- [ ] `src/setupProxy.js` exists
- [ ] `src/services/api.js` updated with API URL logic
- [ ] `.env.local` exists with configuration
- [ ] `package.json` has `http-proxy-middleware` dependency

## Configuration Verification

Check `.env.local`:
```
- [ ] File exists in project root
- [ ] Can be opened without errors
- [ ] Contains API configuration
```

Check `src/setupProxy.js`:
```
- [ ] File exists in src directory
- [ ] Contains createProxyMiddleware setup
- [ ] Target is https://stagev2.appletechlabs.com
- [ ] Path rewrite is configured
```

## Development Server Verification

After running `npm start`:

- [ ] Server starts without errors
- [ ] Port 3000 is available
- [ ] Browser opens to http://localhost:3000
- [ ] React app loads
- [ ] No build errors in terminal

## API Connectivity Verification

In Browser (http://localhost:3000/login):

1. **Check Browser Console (F12)**
   - [ ] No errors shown
   - [ ] Message shows: `[API CONFIG] Base URL: /api`
   - [ ] No CORS errors
   - [ ] No 404 errors

2. **Try Login**
   - [ ] Email field accepts input
   - [ ] Password field accepts input
   - [ ] Submit button clicks
   - [ ] Request is made (Network tab shows /api call)
   - [ ] No CORS error in response

3. **Check Node Console**
   - [ ] See proxy middleware logs
   - [ ] See request being proxied to backend
   - [ ] See response coming back

## Network Access Verification

From another machine on the network:

1. **Start with network binding**
   ```bash
   set HOST=0.0.0.0
   npm start
   ```
   - [ ] Server starts successfully

2. **Access from other machine**
   - [ ] Open browser to `http://192.16.26.167:3000`
   - [ ] React app loads
   - [ ] Login page displays

3. **Test API calls**
   - [ ] Can submit login form
   - [ ] Network requests go through
   - [ ] No CORS errors

## Browser DevTools Verification

F12 → Console Tab:
- [ ] Logs show `[API CONFIG]` messages
- [ ] No red error messages
- [ ] No CORS-related errors

F12 → Network Tab:
- [ ] Requests to `/api/*` show status 200/401/422
- [ ] NOT showing CORS errors
- [ ] Responses contain expected data

F12 → Application Tab:
- [ ] Local Storage has `authToken` after login
- [ ] Cookies properly set

## Production Build Verification

```bash
npm run build
npm install -g serve
serve -s build
```

- [ ] Build completes without errors
- [ ] `build/` directory created
- [ ] Can start serve
- [ ] App works on `http://localhost:3000`
- [ ] `setupProxy.js` NOT in build files (development only)

## Endpoint Verification

Try these endpoints after setup:

**Authentication**
- [ ] `POST /api/auth/login` - Can submit
- [ ] `POST /api/auth/register` - Can submit
- [ ] `GET /api/auth/me` - Can call with token
- [ ] `POST /api/auth/refresh` - Can call with token

**Quotation** (require auth)
- [ ] `GET /api/quotation/list` - Returns data
- [ ] `GET /api/quotation/view/pnl` - Returns data

## Error Scenarios - Should NOT See

Check that these errors are NOT appearing:

- [ ] ❌ "Cannot connect to server"
- [ ] ❌ "CORS error"
- [ ] ❌ "Access-Control-Allow-Origin"
- [ ] ❌ "Failed to fetch from"
- [ ] ❌ "http-proxy-middleware not found"
- [ ] ❌ "setupProxy.js not found"

## Success Indicators

You'll know it's working when:

✅ App loads without errors
✅ Console shows: `[API CONFIG] Base URL: /api`
✅ Can enter email and password
✅ Submit button works
✅ Network requests go to `/api/auth/login`
✅ No CORS errors anywhere
✅ Response shows 401 (invalid creds) not CORS error

## Troubleshooting Checklist

If something doesn't work:

1. **Reinstall**
   - [ ] `npm cache clean --force`
   - [ ] Delete `node_modules`
   - [ ] Delete `package-lock.json`
   - [ ] Run `npm install`
   - [ ] Run `npm start`

2. **Clear Cache**
   - [ ] Delete `.eslintcache`
   - [ ] Delete `node_modules/.cache`
   - [ ] Restart dev server

3. **Verify Files**
   - [ ] Check `src/setupProxy.js` exists
   - [ ] Check `src/services/api.js` is updated
   - [ ] Check `package.json` has dependency

4. **Check Backend**
   - [ ] Try `https://stagev2.appletechlabs.com/api` in browser
   - [ ] Should get 404 or 401, not connection error
   - [ ] Check internet connection

5. **Check Port**
   - [ ] Verify port 3000 is available
   - [ ] Try different port: `set PORT=3001`

## Final Sign-Off

When all checkboxes are complete:

✅ Development environment is fully configured
✅ CORS issues are resolved
✅ API connectivity working
✅ Can run app on localhost
✅ Can access from network
✅ Ready for development
✅ Ready for deployment

---

**Date Verified**: [Your Date]
**Status**: ✅ READY FOR DEVELOPMENT

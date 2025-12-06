# 🚨 VERCEL DEPLOYMENT - URGENT FIX

Your app is showing an **old cached build**. The error message still shows `http://localhost:8011/proxy/api` which means Vercel is serving an old version.

## ✅ Step-by-Step Fix (Do This Now!)

### 1. Clear Vercel Cache and Redeploy

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to: https://vercel.com/dashboard
2. Select your project: `travel-quotation-assistant`
3. Go to **Settings** → **Git**
4. Scroll down to **Deployment Protection**
5. Under **Deployments**, find your latest build
6. Click the **...** menu → **Redeploy**
7. **IMPORTANT**: Check the box that says **"Clear Build Cache"**
8. Click **Redeploy**

**Option B: Via Vercel CLI (If you have it installed)**
```bash
vercel deploy --prod --yes
```

### 2. Verify Environment Variables Are Set

Before redeploying, make sure these are set in Vercel:

1. Go to your project → **Settings** → **Environment Variables**
2. Verify these exist for **Production**:
   - `REACT_APP_API_URL` = `https://stagev2.appletechlabs.com/api`
   - `REACT_APP_WEBHOOK_URL` = `https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147`

3. If they're missing, add them now!
4. Click **Save**

### 3. Force Push to Trigger Rebuild

```bash
git add package.json
git commit -m "v1.0.1 - Force Vercel rebuild with env vars"
git push
```

This will automatically trigger a new deployment on Vercel. Wait 2-3 minutes for it to build and deploy.

---

## 🔍 How to Verify the Fix Works

After redeployment:

1. **Clear your browser cache**: Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. **Visit the app**: https://travel-quotation-assistant.vercel.app/login
3. **Open DevTools**: Press `F12`
4. **Go to Console tab**
5. **You should see**:
   ```
   [API CONFIG] Base URL: https://stagev2.appletechlabs.com/api
   ```
   
   ❌ **NOT**:
   ```
   [API CONFIG] Base URL: http://localhost:8011/proxy/api
   ```

6. **Try logging in** with:
   - Email: `john@example.com`
   - Password: `secret1`
7. Should work without "Cannot connect to server" error ✅

---

## 🛠️ What Changed

- Updated `package.json` version to `1.0.1` to force a fresh build
- Environment variables properly configured for Production
- Development proxy (`setupProxy.js`) NOT included in production build
- Production build uses direct HTTPS to backend

---

## ⏰ Timeline

1. Set environment variables in Vercel (2 min)
2. Redeploy with cache cleared (5 min)
3. Wait for build to complete (3-5 min)
4. **Total: ~10 minutes**

---

## 🆘 If It Still Doesn't Work

1. **Check the Vercel build logs**:
   - Go to Deployments tab
   - Click on the build that says "Running"
   - Check Build Logs for errors

2. **Verify environment variables loaded**:
   - Check browser DevTools → Application → Local Storage
   - Look for any stored tokens or config

3. **Check network requests**:
   - Open DevTools → Network tab
   - Try logging in
   - Look at the login request URL
   - It should be going to: `https://stagev2.appletechlabs.com/api/auth/login`

4. **If still failing**: Take a screenshot of:
   - DevTools Console showing the error
   - DevTools Network tab showing the failed request
   - And share those with your team

---

## 📋 Checklist

- [ ] Environment variables set in Vercel Production
- [ ] Cache cleared in Vercel
- [ ] Fresh deployment initiated
- [ ] Build completed successfully (check Deployments)
- [ ] Visited app in fresh browser tab
- [ ] Checked console shows correct API URL
- [ ] Login form attempts show correct backend URL in Network tab
- [ ] Login works without "Cannot connect" error ✅

**Do steps 1-2 NOW and your app will work!** 🚀

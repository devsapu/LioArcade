# Fix Railway "Railpack could not determine how to build" Error

## Problem
Railway is scanning the root directory instead of the `backend` directory, causing this error:
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## Solution: Set Root Directory in Railway UI

**This is a CRITICAL step that must be done in Railway's web interface.**

### Step-by-Step Fix

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Log in to your account

2. **Select Your Project**
   - Click on your LioArcade project

3. **Select Your Backend Service**
   - Click on the service that's failing (the one you're trying to deploy)

4. **Open Settings**
   - Click on the **"Settings"** tab (usually at the top)

5. **Find Root Directory Setting**
   - Scroll down to find **"Root Directory"** field
   - It might be under "General" or "Build & Deploy" section

6. **Set Root Directory** ⚠️ **CRITICAL**
   - In the **"Root Directory"** field, enter: `backend`
   - **Do NOT** include quotes, slashes, or any other characters
   - Just type: `backend`

7. **Save Changes**
   - Click **"Save"** or the save button
   - Railway will automatically trigger a new deployment

8. **Verify Build**
   - Go to the **"Deployments"** tab
   - Watch the new deployment logs
   - You should now see Railway detecting Node.js and building successfully

## What Should Happen After Fix

After setting the Root Directory, Railway logs should show:
```
Using Nixpacks
Detected Node.js project
Installing dependencies...
Running npm install
Starting with: npm start
```

## Why This Happens

Railway scans the repository root by default. Since your Node.js app is in the `backend/` subdirectory, Railway can't find `package.json` at the root level and doesn't know it's a Node.js project.

## Files Created to Help

I've also created these files to help Railway detect your app:
- `backend/nixpacks.toml` - Helps Railway detect Node.js configuration
- `backend/railway.json` - Railway deployment configuration
- `railway.json` - Root-level Railway config (backup)

However, **the Root Directory setting in Railway UI is still required** for Railway to know where to look.

## If It Still Fails

1. **Double-check Root Directory**
   - Go back to Settings
   - Verify it's exactly: `backend` (no quotes, no trailing slash)

2. **Check Build Command**
   - In Settings → Build & Deploy
   - **Build Command should be EMPTY** (let Railway auto-detect)
   - **Start Command should be:** `npm start`

3. **Force Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

4. **Check Logs**
   - Look for "Detected Node.js" or "Using Nixpacks" messages
   - Should see `package.json` being found in `backend/` directory

---

**After setting Root Directory to `backend`, your deployment should succeed!** 🚀

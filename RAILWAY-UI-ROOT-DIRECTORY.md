# ⚠️ CRITICAL: Set Root Directory in Railway UI

## The Problem

Railway is reading `railpack.json` but still scanning the root directory (`./`) instead of `backend/`. This happens because **Railway requires the Root Directory to be set in the web UI** - config files alone are not enough.

## The Solution (MUST DO IN RAILWAY UI)

### Step-by-Step Instructions:

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Log in

2. **Navigate to Your Service**
   - Click on your **LioArcade** project
   - Click on your **backend service** (the one failing to deploy)

3. **Open Settings**
   - Click the **"Settings"** tab at the top

4. **Find Root Directory Setting**
   - Look for **"Root Directory"** field
   - It's usually under **"General"** or **"Source"** section
   - Scroll down if needed

5. **Set Root Directory** ⚠️ **THIS IS CRITICAL**
   - Click in the **"Root Directory"** field
   - Type exactly: `backend`
   - **NO quotes, NO slashes, NO trailing slash**
   - Just: `backend`

6. **Save Changes**
   - Click **"Save"** button
   - Railway will automatically trigger a new deployment

7. **Verify**
   - Go to **"Deployments"** tab
   - Watch the new deployment logs
   - You should see Railway analyzing `backend/` directory instead of `./`

## What Should Happen

After setting Root Directory to `backend` in Railway UI:

```
[Region: us-west1]

╭─────────────────╮
│ Railpack 0.16.0 │
╰─────────────────╯

↳ Using config file `railpack.json`
Detected Node.js project
Found package.json in backend/
Installing dependencies...
Starting with: npm start
```

## Why Config Files Aren't Enough

- `railpack.json` is being read (you see "↳ Using config file `railpack.json`")
- But Railway analyzes the directory structure **BEFORE** processing config files
- The Root Directory must be set in Railway's UI so it knows WHERE to look first
- Config files then provide additional instructions for that directory

## Current Configuration Files

These files are already in place and will work once Root Directory is set:

- ✅ `railway.json` - Specifies RAILPACK builder and rootDirectory
- ✅ `railpack.json` - Provides start command
- ✅ `backend/railpack.json` - Backend-specific config
- ✅ `backend/package.json` - Has correct `start` script

## If It Still Fails

1. **Double-check Root Directory in UI**
   - Go back to Settings
   - Verify it says exactly: `backend` (no quotes)

2. **Check Build & Deploy Settings**
   - Build Command: Should be **EMPTY** (let Railway auto-detect)
   - Start Command: Should be `npm start` (or empty to use railpack.json)

3. **Force Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

4. **Check Logs**
   - Should see "Detected Node.js project"
   - Should see `package.json` being found
   - Should NOT see `./` as analyzed directory

---

**The Root Directory UI setting is REQUIRED - config files cannot override it!** 🚀

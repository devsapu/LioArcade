# Fix Railway Build Error: "npm: command not found"

## Problem

Railway is trying to run `npm install && npx prisma generate` **before** Node.js is installed, causing the error:
```
/bin/bash: line 1: npm: command not found
```

## Root Cause

Railway has a **Build Command** set in the UI that overrides your code configuration. This command runs before Nixpacks installs Node.js.

## Solution: Clear Build Command in Railway UI

### Step-by-Step Instructions

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Log in to your account

2. **Select Your Project**
   - Click on your LioArcade project

3. **Select Backend Service**
   - Click on your backend service (the one that's failing to build)

4. **Open Settings**
   - Click on **"Settings"** tab (top right)

5. **Go to Build & Deploy Section**
   - Scroll down to **"Build & Deploy"** section

6. **Clear Build Command** ⚠️ **CRITICAL STEP**
   - Find the **"Build Command"** field
   - **DELETE/CLEAR everything** in that field
   - Leave it completely **EMPTY**
   - Do NOT put anything like `npm install` or `cd backend`

7. **Set Start Command**
   - Find the **"Start Command"** field
   - Set it to: `npm start`
   - (Should already be correct)

8. **Verify Root Directory**
   - Scroll up to **"Root Directory"** field
   - Make sure it's set to: `backend`
   - (Without quotes, just the word: backend)

9. **Save Changes**
   - Click **"Save"** or the save button
   - Railway will automatically trigger a new deployment

10. **Wait for Build**
    - Watch the deployment logs
    - Nixpacks should now:
      - Auto-detect Node.js from `package.json`
      - Install Node.js automatically
      - Run `npm install` (which triggers `postinstall` script)
      - Generate Prisma client via `postinstall` script
      - Start server with `npm start`

## What Should Happen

After clearing the Build Command, Railway logs should show:

```
Using Nixpacks
╔════════════════ Nixpacks v1.38.0 ═══════════════╗
║ build      │ (auto-detected)                    ║
║─────────────────────────────────────────────────║
║ start      │ npm start                         ║
╚═════════════════════════════════════════════════╝
```

Notice: **No build command** - Nixpacks handles it automatically!

## Why This Works

- **Nixpacks** (Railway's build system) automatically detects Node.js projects
- It reads your `package.json` and installs Node.js + npm
- Then runs `npm install` automatically
- Your `postinstall` script runs `prisma generate` after install
- Finally runs `npm start` to start your server

## If It Still Fails

1. **Double-check Build Command is empty**
   - Go back to Settings → Build & Deploy
   - Verify Build Command field is completely empty

2. **Check Root Directory**
   - Should be exactly: `backend` (no quotes, no slashes)

3. **Force Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

4. **Check Logs**
   - Look for "Using Nixpacks" message
   - Should NOT see a custom build command

## Visual Guide

```
Railway Dashboard
  └── Your Project
      └── Backend Service
          └── Settings Tab
              └── Build & Deploy Section
                  ├── Build Command: [EMPTY] ← Clear this!
                  ├── Start Command: npm start
                  └── Root Directory: backend
```

---

**After clearing the Build Command, your deployment should succeed!** 🚀

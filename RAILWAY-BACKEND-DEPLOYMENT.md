# 🚀 Railway Backend Deployment Guide

## Step-by-Step Instructions

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)

---

### Step 2: Create PostgreSQL Database

1. In your Railway project dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Wait for database to provision (~30 seconds)
3. Click on the **PostgreSQL** service
4. Go to **"Variables"** tab
5. **Copy the `DATABASE_URL`** - you'll need it in Step 4

---

### Step 3: Deploy Backend Service

1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your **`LioArcade`** repository
3. Railway will auto-detect Node.js

**Configure Service:**
- **Root Directory:** `backend` ⚠️ **IMPORTANT!**
- **Build Command:** Railway auto-detects (should be `npm install`)
- **Start Command:** `npm start` (should auto-detect)

**To set Root Directory:**
- Click on the service → **"Settings"** tab
- Scroll to **"Root Directory"**
- Enter: `backend`
- Click **"Save"**

---

### Step 4: Set Environment Variables

Go to your **Backend Service** → **"Variables"** tab → Click **"New Variable"**

Add these variables one by one:

#### 1. Database URL (Auto-set by Railway)
- Railway should automatically add `DATABASE_URL` when you link the PostgreSQL service
- If not, go to PostgreSQL service → Variables → Copy `DATABASE_URL` → Add to backend service

#### 2. JWT Secrets (Generated for you)
```
JWT_SECRET=051b0c5fb275d9c8b6eeca83266455fae4f64a160257fbab7bc466fa087c0fd1
JWT_REFRESH_SECRET=033d557122d9a54f21e97cee023b27777ba62624ddb9f619ed66031f2b614d1f
```

#### 3. JWT Expiration
```
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### 4. Server Configuration
```
PORT=3001
NODE_ENV=production
```

#### 5. CORS Origin (Your Vercel Frontend URL)
```
CORS_ORIGIN=https://lio-arcade-jpk3-4mvxozjy1-sapumals-projects-93db334b.vercel.app
```

---

### Step 5: Run Database Migrations

After the backend deploys:

1. Go to your **Backend Service** → **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"**
4. Open Railway CLI or use the web terminal

**Run migrations:**
```bash
npx prisma migrate deploy
```

**Or add to package.json scripts:**
```json
"deploy": "prisma migrate deploy && npm start"
```

---

### Step 6: Get Your Backend URL

1. Go to your **Backend Service** → **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"** (if not already generated)
4. Copy the URL (e.g., `https://your-backend.up.railway.app`)

**Test Health Endpoint:**
Visit: `https://your-backend.up.railway.app/health`

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

### Step 7: Update Frontend Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **"Settings"** → **"Environment Variables"**
2. Add/Update:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend.up.railway.app` (your Railway backend URL)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
3. Click **"Save"**
4. **Redeploy** frontend (Deployments → ... → Redeploy)

---

## ✅ Verification Checklist

- [ ] Database created and `DATABASE_URL` copied
- [ ] Backend service deployed with root directory `backend`
- [ ] All environment variables set
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Backend URL obtained
- [ ] Health check works (`/health` endpoint)
- [ ] Frontend environment variable updated
- [ ] Frontend redeployed

---

## 🆘 Troubleshooting

### Build Fails
- Check Root Directory is set to `backend`
- Check build logs for errors
- Ensure `package.json` has `start` script

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check database is running (Railway dashboard)
- Ensure SSL mode: `?sslmode=require` in DATABASE_URL

### CORS Errors
- Verify `CORS_ORIGIN` matches your Vercel URL exactly
- No trailing slash in CORS_ORIGIN
- Redeploy backend after changing CORS_ORIGIN

### Migrations Fail
- Check `DATABASE_URL` is correct
- Ensure Prisma schema is up to date
- Run `npx prisma migrate deploy` manually

---

## 📝 Quick Reference

**Frontend URL:** `https://lio-arcade-jpk3-4mvxozjy1-sapumals-projects-93db334b.vercel.app`  
**Backend URL:** `https://your-backend.up.railway.app` (get from Railway)

**Environment Variables Needed:**

**Railway Backend:**
- `DATABASE_URL` (auto-set)
- `JWT_SECRET` (see above)
- `JWT_REFRESH_SECRET` (see above)
- `JWT_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `PORT=3001`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://lio-arcade-jpk3-4mvxozjy1-sapumals-projects-93db334b.vercel.app`

**Vercel Frontend:**
- `NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app`

---

**Ready? Let's start with Step 1!** 🚀

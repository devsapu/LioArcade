# 🚀 Quick Deployment Guide - LioArcade

**Estimated Time:** 15-20 minutes

## Prerequisites Checklist

- [x] ✅ Code committed to GitHub
- [x] ✅ All dependencies installed locally
- [x] ✅ Database schema ready
- [ ] ⏳ Railway account (create at https://railway.app)
- [ ] ⏳ Vercel account (create at https://vercel.com)

---

## Step 1: Railway Setup (Backend + Database)

### 1.1 Create Railway Account & Project

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up/login with **GitHub** (recommended)
4. Click **"New Project"**
5. Select **"Deploy from GitHub repo"**
6. Choose your **LioArcade** repository

### 1.2 Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create PostgreSQL database
   - Generate `DATABASE_URL` environment variable
   - Make it available to all services

**✅ Note:** Copy the `DATABASE_URL` from the database service (Settings → Variables) for reference.

### 1.3 Add Backend Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your **LioArcade** repository
3. **⚠️ CRITICAL STEP:** Before Railway starts building:
   - Go to **Settings** → **"Root Directory"**
   - Enter: `backend`
   - Click **Save**
4. Railway will auto-detect Node.js and start building

### 1.4 Configure Environment Variables

Go to your backend service → **"Variables"** tab → Add these:

```env
# Database (auto-set by Railway - verify it exists)
DATABASE_URL=postgresql://... (automatically set)

# JWT Authentication (USE THE SECRETS BELOW)
JWT_SECRET=[GENERATED_SECRET_1]
JWT_REFRESH_SECRET=[GENERATED_SECRET_2]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS (update after frontend deployment)
CORS_ORIGIN=https://your-frontend.vercel.app
```

**🔐 JWT Secrets Generated:**
Check the terminal output for your generated secrets, or use:
- Online generator: https://generate-secret.vercel.app/32
- Or run locally: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 1.5 Configure Build Settings

Go to backend service → **Settings** → **"Build & Deploy"**:

- **Build Command:** Leave **EMPTY** (Nixpacks auto-detects)
- **Start Command:** `npm start`

**Why?** The `postinstall` script in `package.json` automatically runs `prisma generate`.

### 1.6 Deploy & Verify

1. Railway will automatically deploy when you connect the repo
2. Wait for build to complete (check "Deployments" tab)
3. Railway will provide a URL like: `https://your-app.up.railway.app`
4. **📝 Note this URL** - you'll need it for frontend

**Test Backend:**
Visit: `https://your-backend.up.railway.app/api/health`

Should return: `{"status":"ok","timestamp":"..."}`

### 1.7 Run Database Migrations

**Option A: Via Railway Console (Recommended)**
1. Railway → Your Project → Backend Service → **"Deployments"**
2. Click on the latest deployment → **"Console"** tab
3. Run: `npx prisma migrate deploy`

**Option B: Via Local Machine**
```bash
cd backend
DATABASE_URL="your_railway_db_url" npx prisma migrate deploy
```

---

## Step 2: Vercel Setup (Frontend)

### 2.1 Create Vercel Project

1. Go to **https://vercel.com**
2. Sign up/login with **GitHub**
3. Click **"Add New Project"**
4. Import your **LioArcade** GitHub repository

### 2.2 Configure Project Settings

In the project configuration screen:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend` ⚠️ **IMPORTANT!**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 2.3 Configure Environment Variables

Before deploying, go to **"Environment Variables"** → Add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

**Replace `your-backend.up.railway.app` with your actual Railway backend URL.**

### 2.4 Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. You'll get a URL like: `https://your-app.vercel.app`
4. **📝 Note this URL**

### 2.5 Update Backend CORS

Go back to Railway → Backend Service → **"Variables"**:

Update `CORS_ORIGIN` to your Vercel URL:
```env
CORS_ORIGIN=https://your-app.vercel.app
```

Railway will automatically redeploy with the new CORS setting.

---

## Step 3: Post-Deployment Testing

### 3.1 Test Backend

- [ ] Health check: `https://your-backend.up.railway.app/api/health`
- [ ] API info: `https://your-backend.up.railway.app/api`

### 3.2 Test Frontend

- [ ] Visit your Vercel URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test dashboard
- [ ] Test profile page
- [ ] Test content browsing
- [ ] Test leaderboard

### 3.3 Verify Database

- [ ] Check Railway → PostgreSQL service → Data tab
- [ ] Verify tables exist: `users`, `content`, `user_progress`, `gamification`

---

## Troubleshooting

### Backend Issues

**"Railpack could not determine how to build"**
- Solution: Set Root Directory to `backend` in Railway settings

**"npm: command not found"**
- Solution: Clear Build Command field, leave it empty

**Database connection fails**
- Solution: Verify `DATABASE_URL` is set in Railway variables

**CORS errors**
- Solution: Ensure `CORS_ORIGIN` matches your Vercel URL exactly (including `https://`)

### Frontend Issues

**API calls fail**
- Solution: Check `NEXT_PUBLIC_API_URL` is correct in Vercel
- Verify backend is running (check Railway logs)

**Build fails**
- Solution: Check build logs in Vercel dashboard

---

## Quick Reference

**Backend URL:** `https://your-backend.up.railway.app`  
**Frontend URL:** `https://your-app.vercel.app`  
**Health Check:** `https://your-backend.up.railway.app/api/health`

---

## Cost Estimate

- **Vercel:** Free (unlimited for personal projects)
- **Railway:** $5/month free credit (usually covers small apps)
- **Total:** ~$0-5/month

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure monitoring (optional)
3. ✅ Set up backups (Railway auto-backups enabled)
4. ✅ Review security settings

**Need more details?** See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

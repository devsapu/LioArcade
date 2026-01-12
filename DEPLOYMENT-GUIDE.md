# LioArcade Deployment Guide

Complete deployment guide for LioArcade using **Vercel + Railway** - the simplest and most cost-effective setup.

## 🎯 Deployment Architecture

**Vercel + Railway** - Everything you need with just 2 platforms:
- **Vercel:** Frontend (Next.js) - Free tier
- **Railway:** Backend (Express.js) + Database (PostgreSQL) - $5/month free credit

**Why this setup?**
- ✅ Railway hosts both backend and database in one project
- ✅ Automatic database connection via `DATABASE_URL`
- ✅ Simple management and monitoring
- ✅ Cost-effective (~$0-5/month)
- ✅ Free tiers available for both platforms

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Guide](#quick-start-guide)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
   - [Step 1: Railway Setup (Database + Backend)](#step-1-railway-setup-database--backend)
   - [Step 2: Vercel Setup (Frontend)](#step-2-vercel-setup-frontend)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Production Checklist](#production-checklist)
8. [Cost Estimate](#cost-estimate)
9. [Alternative Options](#alternative-options) *(Optional)*

---

## Prerequisites

Before starting, ensure you have:
- ✅ **GitHub account** (with your code repository)
- ✅ **Vercel account** ([Sign up](https://vercel.com) - free tier available)
- ✅ **Railway account** ([Sign up](https://railway.app) - $5/month free credit)

---

## Quick Start Guide

### 🚀 5-Minute Deployment

**Step 1: Railway (Backend + Database)**
1. Create Railway project
2. Add PostgreSQL database
3. Add backend service (connect GitHub repo, set root to `backend`)
4. Railway auto-links database → backend
5. Add environment variables
6. Deploy!

**Step 2: Vercel (Frontend)**
1. Import GitHub repo
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy!

**That's it!** See detailed steps below.

---

## Detailed Deployment Steps

### Step 1: Railway Setup (Database + Backend)

#### 1.1 Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your LioArcade repository

#### 1.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Generate a `DATABASE_URL` environment variable
   - Make it available to all services in the project

**💡 Tip:** Copy the `DATABASE_URL` for reference (you'll see it in the database service settings).

#### 1.3 Add Backend Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your repository
3. **⚠️ CRITICAL:** Set the **Root Directory** to `backend` BEFORE Railway starts building
   - Go to Settings → "Root Directory" → Enter `backend`
   - This tells Railway where your Node.js app is located
   - If you skip this step, Railway will fail to detect your app (see troubleshooting)

4. Railway will auto-detect it's a Node.js project once root directory is set

#### 1.4 Configure Environment Variables

Go to your backend service → **"Variables"** tab → Add these:

```env
# Database (auto-linked from Railway PostgreSQL)
DATABASE_URL=postgresql://... (automatically set by Railway)

# JWT Authentication
JWT_SECRET=your_very_long_random_secret_key_here
JWT_REFRESH_SECRET=your_another_very_long_random_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS (update after frontend deployment)
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Generate JWT Secrets:**
```powershell
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Or use online: https://generate-secret.vercel.app/32
```

#### 1.5 Configure Build Settings

Go to backend service → **Settings** → **"Build & Deploy"**:

- **Build Command:** `cd backend && npm install && npx prisma generate`
- **Start Command:** `cd backend && npm start`

#### 1.6 Deploy Backend

1. Railway will automatically deploy when you connect the repo
2. Wait for the build to complete
3. Railway will provide a URL like: `https://your-app.up.railway.app`
4. **Note this URL** - you'll need it for the frontend

#### 1.7 Run Database Migrations

After backend is deployed:

**Option A: Via Railway Console (Recommended)**
1. Railway → Your Project → Backend Service → **"Deployments"**
2. Click on the latest deployment → **"Console"**
3. Run: `npx prisma migrate deploy`

**Option B: Via Local Machine**
```bash
cd backend
DATABASE_URL="your_railway_db_url" npx prisma migrate deploy
```

#### 1.8 Verify Backend Health

Visit: `https://your-backend.up.railway.app/api/health`

Should return: `{"status":"ok","timestamp":"..."}`

---

### Step 2: Vercel Setup (Frontend)

#### 2.1 Create Vercel Project

1. Go to [Vercel](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Select your LioArcade repository

#### 2.2 Configure Project Settings

In the project configuration:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend` ⚠️ **Important!**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

#### 2.3 Configure Environment Variables

Go to **"Environment Variables"** → Add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

Replace `your-backend.up.railway.app` with your actual Railway backend URL.

#### 2.4 Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. You'll get a URL like: `https://your-app.vercel.app`
4. **Note this URL**

#### 2.5 Update Backend CORS

Go back to Railway → Backend Service → **"Variables"**:

Update `CORS_ORIGIN` to your Vercel URL:
```env
CORS_ORIGIN=https://your-app.vercel.app
```

Railway will automatically redeploy with the new CORS setting.

---

## Environment Variables

### Backend (Railway)

```env
# Database (auto-set by Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/railway?sslmode=require

# JWT Authentication
JWT_SECRET=your_long_random_secret_here
JWT_REFRESH_SECRET=your_another_long_random_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## Post-Deployment

### 1. Verify Everything Works

**Backend:**
- ✅ Health check: `https://your-backend.up.railway.app/api/health`
- ✅ Test API endpoints

**Frontend:**
- ✅ Visit your Vercel URL
- ✅ Test user registration
- ✅ Test user login
- ✅ Test dashboard and features

### 2. Test Key Features

- [ ] User registration
- [ ] User login
- [ ] Token refresh
- [ ] Dashboard loads
- [ ] Profile page works
- [ ] Content (quizzes/flashcards/games) loads
- [ ] Leaderboard displays
- [ ] Progress tracking works

### 3. File Uploads (if applicable)

If using local file storage for profile images:
- **Option A:** Use cloud storage (AWS S3, Cloudinary, etc.) - **Recommended**
- **Option B:** Use Railway's persistent storage
- **Option C:** Keep local storage (files will be lost on redeploy)

---

## Troubleshooting

### Backend Issues

**Problem:** Railway can't detect Node.js app / "Railpack could not determine how to build"
- **Solution:** 
  1. Go to Railway → Your Backend Service → Settings → "Root Directory"
  2. Set it to `backend` (without quotes)
  3. Save and redeploy
  4. Railway will now detect your `package.json` in the `backend` folder

**Problem:** Database connection fails
- **Solution:** Check `DATABASE_URL` is set correctly in Railway. Railway should auto-set this if database and backend are in the same project.

**Problem:** "Invalid token" errors
- **Solution:** Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set correctly in Railway environment variables.

**Problem:** CORS errors
- **Solution:** Ensure `CORS_ORIGIN` matches your Vercel URL exactly (including `https://`).

**Problem:** Migrations fail
- **Solution:** Run migrations via Railway console: `npx prisma migrate deploy`

### Frontend Issues

**Problem:** API calls fail
- **Solution:** 
  1. Check `NEXT_PUBLIC_API_URL` is correct in Vercel
  2. Verify backend is running (check Railway logs)
  3. Check CORS settings in backend

**Problem:** Build fails
- **Solution:** Check build logs in Vercel, ensure all dependencies are in `package.json`

**Problem:** Environment variables not working
- **Solution:** Ensure variables start with `NEXT_PUBLIC_` for client-side access

---

## Production Checklist

### Pre-Deployment
- [ ] All code committed to GitHub
- [ ] Database schema finalized
- [ ] All migrations tested locally
- [ ] Environment variables documented
- [ ] `.env` files in `.gitignore`

### Railway (Backend + Database)
- [ ] PostgreSQL database created
- [ ] Backend service deployed
- [ ] All environment variables set
- [ ] Database migrations run successfully
- [ ] Health endpoint returns OK
- [ ] Backend URL noted

### Vercel (Frontend)
- [ ] Frontend project created
- [ ] Root directory set to `frontend`
- [ ] `NEXT_PUBLIC_API_URL` environment variable set
- [ ] Build succeeds
- [ ] Frontend URL noted
- [ ] Backend CORS updated with frontend URL

### Post-Deployment Testing
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] All features tested
- [ ] No console errors
- [ ] Performance is acceptable

---

## Cost Estimate

### Recommended Setup (Vercel + Railway)

- **Vercel:** Free (unlimited for personal projects)
- **Railway:** $5/month free credit
  - Backend: ~$2-3/month
  - PostgreSQL: ~$2-3/month
  - **Total:** Usually fits within free credit for small apps

**Total Cost:** ~$0-5/month for small-scale deployment

---

## Monitoring & Logs

### Railway
- **Logs:** Railway → Project → Service → "Deployments" → Click deployment → "Logs"
- **Metrics:** Railway dashboard shows CPU, memory, and network usage
- **Database:** View database metrics in the PostgreSQL service

### Vercel
- **Logs:** Vercel → Project → "Deployments" → Click deployment → "Functions" tab
- **Analytics:** Available in Vercel dashboard
- **Performance:** Built-in analytics and monitoring

---

## Custom Domain (Optional)

### Backend (Railway)
1. Railway → Project → Backend Service → Settings → "Domains"
2. Add custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in environment variables

### Frontend (Vercel)
1. Vercel → Project → Settings → "Domains"
2. Add your domain
3. Update DNS records
4. Update `NEXT_PUBLIC_API_URL` if backend also has custom domain

---

## Alternative Options

<details>
<summary>Click to view alternative deployment options</summary>

### Alternative Backend: Render

If you prefer Render over Railway:

1. Go to [Render](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** lioarcade-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
6. Add environment variables (same as Railway)
7. Deploy

### Alternative Database: Supabase

If you prefer Supabase over Railway PostgreSQL:

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use the "Connection string" tab, "URI" option)
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`
6. Use this `DATABASE_URL` in your Railway/Render backend

### Alternative Database: Neon

If you prefer Neon over Railway PostgreSQL:

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add `?sslmode=require` to the connection string
5. Use this `DATABASE_URL` in your Railway/Render backend

</details>

---

## Quick Reference Commands

### Generate JWT Secrets

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

**Online Generator:**
https://generate-secret.vercel.app/32

### Test Database Connection (Local)

```bash
cd backend
DATABASE_URL="your_railway_db_url" npx prisma db pull
```

### Run Migrations (Local)

```bash
cd backend
DATABASE_URL="your_railway_db_url" npx prisma migrate deploy
```

---

## Support

If you encounter issues:

1. **Check logs:**
   - Railway: Project → Service → Deployments → Logs
   - Vercel: Project → Deployments → Functions tab

2. **Verify environment variables:**
   - Railway: Service → Variables tab
   - Vercel: Project → Settings → Environment Variables

3. **Check database connection:**
   - Ensure `DATABASE_URL` is set correctly
   - Verify SSL mode (`sslmode=require`)

4. **Verify CORS settings:**
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly

---

**Good luck with your deployment! 🚀**

For a step-by-step checklist, see [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

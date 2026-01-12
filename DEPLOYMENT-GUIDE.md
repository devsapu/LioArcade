# LioArcade Deployment Guide

This guide covers deploying your LioArcade application to production. We'll use **Vercel for Frontend** and **Railway/Render for Backend** as they're free-tier friendly and easy to set up.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway account (free tier available) OR Render account
- PostgreSQL database (Railway, Supabase, or Neon - all have free tiers)

---

## 1. Database Setup

### Option A: Railway PostgreSQL (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the connection string from the database settings
5. Note: Railway provides connection string in format: `postgresql://user:password@host:port/railway`

### Option B: Supabase (Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use the "Connection string" tab, "URI" option)
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option C: Neon (Free Tier)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

**Important:** For all options, add `?sslmode=require` to the connection string for production.

---

## 2. Backend Deployment

### Option A: Railway (Recommended - Easiest)

1. **Prepare your backend:**
   - Ensure all code is committed to GitHub
   - Make sure `backend/package.json` has a `start` script

2. **Deploy to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js project
   - Set the root directory to `backend`

3. **Configure Environment Variables:**
   - In Railway project settings, go to "Variables"
   - Add these variables:
     ```
     DATABASE_URL=your_postgres_connection_string
     JWT_SECRET=your_very_long_random_secret_key_here
     JWT_REFRESH_SECRET=your_another_very_long_random_secret_key_here
     JWT_EXPIRES_IN=15m
     JWT_REFRESH_EXPIRES_IN=7d
     PORT=3001
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend-domain.vercel.app
     ```
   - Generate secrets: Use `openssl rand -base64 32` or an online generator

4. **Database Migration:**
   - Railway will run `npm install` automatically
   - You need to run migrations manually:
     - Go to Railway project → "Deployments" → Click on your deployment
     - Open the terminal/console
     - Run: `cd backend && npx prisma migrate deploy`
     - Or add a build script (see below)

5. **Configure Build Settings:**
   - In Railway, go to Settings → "Build & Deploy"
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`

6. **Get your backend URL:**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Note this URL for frontend configuration

### Option B: Render

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

---

## 3. Frontend Deployment (Vercel)

1. **Prepare your frontend:**
   - Ensure all code is committed to GitHub
   - Make sure `frontend/package.json` has build scripts

2. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Next.js
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build` (default)
     - **Output Directory:** `.next` (default)
     - **Install Command:** `npm install`

3. **Configure Environment Variables:**
   - In Vercel project settings → "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     ```
   - Replace with your actual backend URL

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-app.vercel.app`

5. **Update Backend CORS:**
   - Go back to Railway/Render backend settings
   - Update `CORS_ORIGIN` to your Vercel URL: `https://your-app.vercel.app`

---

## 4. Environment Variables Summary

### Backend (.env in Railway/Render)

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
JWT_SECRET=your_long_random_secret_here
JWT_REFRESH_SECRET=your_another_long_random_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel Environment Variables)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 5. Post-Deployment Steps

### 1. Run Database Migrations

After backend is deployed, run migrations:

**Option A: Via Railway Console**
- Railway → Your Project → Deployments → Click deployment → Console
- Run: `npx prisma migrate deploy`

**Option B: Via Local Machine**
```bash
cd backend
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

### 2. Verify Backend Health

Visit: `https://your-backend.railway.app/api/health`

Should return: `{"status":"ok","timestamp":"..."}`

### 3. Test Frontend

Visit your Vercel URL and test:
- Registration
- Login
- Dashboard
- All features

### 4. Update File Uploads (if using local storage)

If you're using local file storage for profile images, consider:
- **Option A:** Use cloud storage (AWS S3, Cloudinary, etc.)
- **Option B:** Use Railway's persistent storage
- **Option C:** Keep local storage (files will be lost on redeploy)

---

## 6. Custom Domain (Optional)

### Backend (Railway)
1. Railway → Project → Settings → "Domains"
2. Add custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in environment variables

### Frontend (Vercel)
1. Vercel → Project → Settings → "Domains"
2. Add your domain
3. Update DNS records
4. Update `NEXT_PUBLIC_API_URL` if backend also has custom domain

---

## 7. Monitoring & Logs

### Railway
- View logs: Railway → Project → Deployments → Click deployment → Logs
- Monitor: Railway dashboard shows metrics

### Vercel
- View logs: Vercel → Project → "Deployments" → Click deployment → "Functions" tab
- Analytics: Available in Vercel dashboard

---

## 8. Troubleshooting

### Backend Issues

**Problem:** Database connection fails
- **Solution:** Check `DATABASE_URL` format, ensure SSL is enabled (`?sslmode=require`)

**Problem:** "Invalid token" errors
- **Solution:** Check `JWT_SECRET` and `JWT_REFRESH_SECRET` are set correctly

**Problem:** CORS errors
- **Solution:** Update `CORS_ORIGIN` to match your frontend URL exactly

### Frontend Issues

**Problem:** API calls fail
- **Solution:** Check `NEXT_PUBLIC_API_URL` is correct and backend is running

**Problem:** Build fails
- **Solution:** Check build logs in Vercel, ensure all dependencies are in `package.json`

---

## 9. Production Checklist

- [ ] Database migrated and schema is up to date
- [ ] All environment variables set correctly
- [ ] CORS configured for production frontend URL
- [ ] JWT secrets are strong and secure
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Backend health check returns OK
- [ ] Frontend can connect to backend
- [ ] User registration works
- [ ] User login works
- [ ] File uploads work (if applicable)
- [ ] All features tested in production

---

## 10. Cost Estimate (Free Tier)

- **Vercel:** Free (unlimited for personal projects)
- **Railway:** $5/month free credit (usually enough for small apps)
- **Supabase/Neon:** Free tier available
- **Total:** ~$0-5/month for small-scale deployment

---

## Quick Start Commands

### Generate JWT Secrets (Local)
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Or use online: https://generate-secret.vercel.app/32
```

### Test Database Connection (Local)
```bash
cd backend
DATABASE_URL="your_production_url" npx prisma db pull
```

---

## Support

If you encounter issues:
1. Check logs in Railway/Vercel dashboards
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check CORS settings match your frontend URL

---

**Good luck with your deployment! 🚀**

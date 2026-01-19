# Vercel Environment Variables Setup

## Your Vercel URL
**Frontend:** `https://lio-arcade-jpk3-4mvxozjy1-sapumals-projects-93db334b.vercel.app`

## Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar
4. Click **"Add New"**

### Add this variable:

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://your-backend-url.com` (replace with your actual backend URL)  
**Environments:** ✅ Production ✅ Preview ✅ Development

5. Click **"Save"**

## Step 2: Redeploy

After adding the environment variable:

1. Go to **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger automatic redeploy.

## Step 3: Verify

Visit your Vercel URL and check:
- ✅ Page loads without errors
- ✅ No CORS errors in browser console
- ✅ API calls work (try registering/login)

---

## Backend Deployment Needed?

If you don't have a backend deployed yet, we can deploy it on:
- **Railway** (recommended - easiest)
- **Render** (alternative)
- **Vercel** (requires converting Express to Next.js API routes)

Let me know which you prefer!

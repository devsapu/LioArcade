# Deployment Checklist

Use this checklist to ensure everything is ready for deployment using **Vercel + Railway**.

---

## Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] No console.log statements in production code
- [ ] Error handling is in place
- [ ] All environment variables documented
- [ ] `.env` files are in `.gitignore`

### Database
- [ ] Database schema is finalized
- [ ] All migrations are tested locally
- [ ] Prisma schema is up to date

### Backend
- [ ] `backend/package.json` has `start` script
- [ ] All dependencies are listed in `package.json`
- [ ] JWT secrets are ready (generate strong secrets)
- [ ] Health check endpoint works (`/api/health`)

### Frontend
- [ ] `frontend/package.json` has `build` script
- [ ] `next.config.js` is configured correctly
- [ ] Build completes without errors locally
- [ ] All images are optimized

---

## Railway Setup (Backend + Database)

### Database
- [ ] Railway account created
- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Database connection string copied
- [ ] SSL mode configured (`sslmode=require`)

### Backend Service
- [ ] Backend service added to Railway project
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build command configured: `cd backend && npm install && npx prisma generate`
- [ ] Start command configured: `cd backend && npm start`

### Environment Variables (Railway)
- [ ] `DATABASE_URL` set (auto-set by Railway PostgreSQL)
- [ ] `JWT_SECRET` set (strong random secret)
- [ ] `JWT_REFRESH_SECRET` set (strong random secret)
- [ ] `JWT_EXPIRES_IN=15m` set
- [ ] `JWT_REFRESH_EXPIRES_IN=7d` set
- [ ] `PORT=3001` set
- [ ] `NODE_ENV=production` set
- [ ] `CORS_ORIGIN` set (will update after frontend deployment)

### Backend Deployment
- [ ] Backend deployed successfully
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Health endpoint verified: `https://your-backend.up.railway.app/api/health`
- [ ] Backend URL noted for frontend configuration

---

## Vercel Setup (Frontend)

### Project Configuration
- [ ] Vercel account created
- [ ] GitHub repository imported
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` set to Railway backend URL
  - Format: `https://your-backend.up.railway.app/api`

### Frontend Deployment
- [ ] Frontend deployed successfully
- [ ] Build succeeded without errors
- [ ] Frontend URL noted
- [ ] Backend `CORS_ORIGIN` updated with Vercel URL

---

## Post-Deployment Testing

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Logout works
- [ ] Protected routes require authentication

### Core Features
- [ ] Dashboard loads correctly
- [ ] Profile page works
- [ ] Profile image upload works (if applicable)
- [ ] Content browsing works (quizzes/flashcards/games)
- [ ] Leaderboard displays correctly
- [ ] Progress page shows data
- [ ] Navigation works correctly

### Performance
- [ ] Page load times are acceptable
- [ ] API responses are fast (< 2 seconds)
- [ ] Images load correctly
- [ ] No console errors in browser
- [ ] No network errors in browser console

---

## Security Checklist

- [ ] JWT secrets are strong and unique (32+ characters)
- [ ] Database uses SSL (`sslmode=require`)
- [ ] CORS is properly configured (exact URL match)
- [ ] Environment variables are not exposed in client code
- [ ] File uploads are validated (if applicable)
- [ ] API endpoints are protected with authentication middleware
- [ ] Sensitive data is not logged

---

## Monitoring & Maintenance

### Logs
- [ ] Railway logs accessible and monitored
- [ ] Vercel logs accessible and monitored
- [ ] Error logs reviewed for issues

### Monitoring (Optional)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure alerts for critical errors

### Database
- [ ] Database backups configured (Railway auto-backups)
- [ ] Database metrics monitored

---

## Final Verification

- [ ] All features tested in production environment
- [ ] No critical errors in logs
- [ ] Performance meets requirements
- [ ] Security checklist completed
- [ ] Documentation updated with production URLs
- [ ] Team notified of deployment

---

## Quick Reference

**Backend URL:** `https://your-backend.up.railway.app`  
**Frontend URL:** `https://your-app.vercel.app`  
**Health Check:** `https://your-backend.up.railway.app/api/health`

---

**Ready to deploy?** Follow the [Deployment Guide](./DEPLOYMENT-GUIDE.md)

**Need help?** Check the [Troubleshooting](#troubleshooting) section in the deployment guide.

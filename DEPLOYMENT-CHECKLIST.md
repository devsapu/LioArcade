# Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

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
- [ ] Database connection string is ready
- [ ] SSL mode is configured (`sslmode=require`)

### Backend
- [ ] `package.json` has `start` script
- [ ] All dependencies are listed in `package.json`
- [ ] JWT secrets are ready (generate strong secrets)
- [ ] CORS origin is configured for production
- [ ] File upload directory exists (or use cloud storage)
- [ ] Health check endpoint works (`/api/health`)

### Frontend
- [ ] `package.json` has `build` and `start` scripts
- [ ] `next.config.js` is configured correctly
- [ ] API URL environment variable is ready
- [ ] All images are optimized
- [ ] Build completes without errors locally

## Deployment Steps

### 1. Database Setup
- [ ] Create PostgreSQL database (Railway/Supabase/Neon)
- [ ] Copy connection string
- [ ] Test connection locally

### 2. Backend Deployment
- [ ] Deploy to Railway/Render
- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Verify health endpoint works
- [ ] Test API endpoints

### 3. Frontend Deployment
- [ ] Deploy to Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Update backend `CORS_ORIGIN` with Vercel URL
- [ ] Verify build succeeds
- [ ] Test frontend loads correctly

## Post-Deployment Testing

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Logout works

### Features
- [ ] Dashboard loads correctly
- [ ] Profile page works
- [ ] Profile image upload works
- [ ] Games/quizzes/flashcards load
- [ ] Leaderboard displays correctly
- [ ] Progress page shows data

### Performance
- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] Images load correctly
- [ ] No console errors

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] Database uses SSL
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed
- [ ] File uploads are validated
- [ ] API endpoints are protected

## Monitoring

- [ ] Set up error tracking (optional)
- [ ] Monitor application logs
- [ ] Set up uptime monitoring (optional)
- [ ] Configure alerts for errors (optional)

---

**Ready to deploy?** Follow the [Deployment Guide](./DEPLOYMENT-GUIDE.md)

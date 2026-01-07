# Complete Setup Guide - Backend, Frontend & Database

This guide will walk you through setting up the database, backend API, and frontend application step by step.

## Prerequisites

Before starting, make sure you have installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** (already installed)
- **npm** (comes with Node.js)

Verify installations:
```bash
node --version    # Should be v18 or higher
npm --version     # Should be 9.x or higher
psql --version    # Should show PostgreSQL version
```

---

## Step 1: Database Setup

### Option A: Local PostgreSQL Installation

#### 1.1 Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql@14` or download installer
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### 1.2 Start PostgreSQL Service

**Windows:**
- Open Services (Win+R → `services.msc`)
- Find "postgresql-x64-14" (or your version)
- Right-click → Start

**macOS/Linux:**
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

#### 1.3 Create Database

Open PostgreSQL command line:
```bash
# Windows: Use pgAdmin or Command Prompt
# macOS/Linux: Terminal

psql -U postgres
```

In PostgreSQL prompt:
```sql
-- Create database
CREATE DATABASE lioarcade;

-- Create user (optional, or use default postgres user)
CREATE USER lioarcade_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE lioarcade TO lioarcade_user;

-- Exit psql
\q
```

### Option B: Cloud Database (Easier - Recommended)

#### Railway (Free tier available)
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the connection string (DATABASE_URL)

#### Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string

#### Neon (Free tier available)
1. Go to [neon.tech](https://neon.tech)
2. Create account and project
3. Copy the connection string

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install:
- Express.js
- Prisma
- JWT libraries
- bcrypt
- Zod (validation)
- And other dependencies

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

**Windows (PowerShell):**
```powershell
# Create .env file
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

**Edit `.env` file** with your favorite editor and add:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database URL
# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/lioarcade?schema=public"

# For cloud database (Railway/Supabase/Neon), use their connection string:
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Secrets (IMPORTANT: Use strong random strings in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars

# JWT Expiration (optional - defaults shown)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:3000
```

**Generate secure JWT secrets:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use online generator
# Visit: https://generate-secret.vercel.app/32
```

### 2.4 Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

**Optional: View database in Prisma Studio**
```bash
npm run db:studio
```
This opens a browser at `http://localhost:5555` where you can view/edit data.

### 2.5 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📝 Environment: development
```

**Test the API:**
Open browser or use curl:
```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api
```

---

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

Open a **new terminal window** (keep backend running):
```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- And other dependencies

### 3.3 Configure Environment Variables

Create `.env.local` file in the `frontend` directory:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**macOS/Linux:**
```bash
touch .env.local
```

**Edit `.env.local`** and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3.4 Start Frontend Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in X seconds
```

**Open in browser:**
```
http://localhost:3000
```

---

## Step 4: Verify Everything Works

### 4.1 Test Backend API

**Health Check:**
```bash
curl http://localhost:3001/health
```
Expected response:
```json
{"status":"ok","timestamp":"2026-01-07T..."}
```

**API Info:**
```bash
curl http://localhost:3001/api
```
Expected response:
```json
{
  "message": "LioArcade API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 4.2 Test Frontend

1. Open browser: `http://localhost:3000`
2. You should see the LioArcade homepage
3. Click "Get Started" or "Sign In"
4. Try registering a new account:
   - Email: `test@example.com`
   - Password: `testpassword123`
5. After registration, you should be redirected to dashboard

### 4.3 Test Database Connection

**Using Prisma Studio:**
```bash
cd backend
npm run db:studio
```
- Opens at `http://localhost:5555`
- You should see tables: `users`, `content`, `user_progress`, `gamification`
- Check if your registered user appears in `users` table

**Using psql:**
```bash
psql -U postgres -d lioarcade

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

---

## Troubleshooting

### Backend Issues

#### "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql -U postgres -d lioarcade`

#### "Port 3001 already in use"
```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill
```

#### "Prisma Client not generated"
```bash
cd backend
npm run db:generate
```

#### "Module not found" errors
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

#### "Cannot connect to API"
- Verify backend is running on port 3001
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

#### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

#### "Module not found" errors
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

### Database Issues

#### "Database does not exist"
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE lioarcade;

-- Exit
\q
```

#### "Permission denied"
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE lioarcade TO your_user;
```

#### "Connection refused"
- Check PostgreSQL service is running
- Verify port (default: 5432)
- Check firewall settings

---

## Quick Start Commands Summary

### Terminal 1 - Backend
```bash
cd backend
npm install
# Create .env file with database URL and JWT secrets
npm run db:generate
npm run db:push
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

### Terminal 3 - Database (Optional)
```bash
cd backend
npm run db:studio  # Opens Prisma Studio at http://localhost:5555
```

---

## Next Steps After Setup

1. ✅ Backend running on `http://localhost:3001`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ Database created and schema applied
4. ✅ Test user registered

**Now you can:**
- Browse content (once you add some via API or admin panel)
- Take quizzes/flashcards/games
- Earn points and badges
- View leaderboard
- Track your progress

---

## Development Workflow

### Making Changes

**Backend:**
- Edit files in `backend/src/`
- Server auto-reloads (using `--watch`)
- Test endpoints with Postman, curl, or browser

**Frontend:**
- Edit files in `frontend/src/`
- Next.js hot-reloads automatically
- Changes appear instantly in browser

**Database Changes:**
- Edit `backend/prisma/schema.prisma`
- Run `npm run db:push` to apply changes
- Or create migration: `npm run db:migrate`

---

## Need Help?

- Check `IMPLEMENTATION-SETUP.md` for more details
- Check `IMPLEMENTATION-COMPLETE.md` for feature list
- Review error messages in terminal
- Check browser console for frontend errors
- Check backend terminal for API errors

---

**Happy Coding! 🚀**


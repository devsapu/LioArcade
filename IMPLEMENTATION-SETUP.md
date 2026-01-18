# Implementation Setup Guide

This document provides instructions for setting up and running the LioArcade project.

## Project Structure

```
LioArcade/
├── backend/          # Node.js + Express API
├── frontend/         # Next.js web application
├── mobile/           # React Native app (future)
├── docs/             # Project documentation
└── _bmad-output/     # BMAD workflow outputs
```

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or use a cloud database)
- **Git**

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file (create .env manually if needed)
# Update DATABASE_URL, JWT_SECRET, and JWT_REFRESH_SECRET
```

Create a `.env` file with:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/lioarcade?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Database Setup

### Using Local PostgreSQL

1. Create a database:
```sql
CREATE DATABASE lioarcade;
```

2. Update `DATABASE_URL` in backend `.env` file

3. Run Prisma migrations:
```bash
cd backend
npm run db:push
```

### Using Cloud Database (Recommended for Production)

- **Railway**: https://railway.app
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech

Update `DATABASE_URL` in backend `.env` with your cloud database connection string.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

## Development Workflow

1. **Backend Development:**
   - Make changes in `backend/src/`
   - Server auto-reloads with `npm run dev`
   - Test endpoints using Postman or curl

2. **Frontend Development:**
   - Make changes in `frontend/src/`
   - Next.js hot-reloads automatically
   - Test in browser at `http://localhost:3000`

3. **Database Changes:**
   - Update `backend/prisma/schema.prisma`
   - Run `npm run db:push` to apply changes
   - Or create migration: `npm run db:migrate`

## Next Steps

1. ✅ Backend API structure created
2. ✅ Frontend Next.js app structure created
3. ✅ Authentication service implemented
4. ⏭️ Implement content service
5. ⏭️ Implement gamification service
6. ⏭️ Create frontend authentication pages
7. ⏭️ Create content browsing UI
8. ⏭️ Add gamification UI components

## Testing the Setup

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Test API health: `curl http://localhost:3001/health`
4. Test API info: `curl http://localhost:3001/api`

## Troubleshooting

### Backend Issues

- **Database connection error**: Check `DATABASE_URL` in `.env`
- **Port already in use**: Change `PORT` in `.env` or stop the process using port 3001
- **Prisma errors**: Run `npm run db:generate` again

### Frontend Issues

- **API connection error**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
- **Build errors**: Delete `.next` folder and run `npm run dev` again

## Git Workflow

We're working on the `dev` branch. When ready to merge:

```bash
git add .
git commit -m "Your commit message"
git push origin dev
```

Then create a pull request to merge `dev` into `main`.




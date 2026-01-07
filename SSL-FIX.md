# Fix PostgreSQL SSL Connection Error

## Problem

You're seeing this error:
```
psql: error: connection to server at "localhost" (::1), port 5432 failed: 
server does not support SSL, but SSL was required
```

## Solution

For **local PostgreSQL** development, you need to disable SSL in your connection string.

### Update your `backend/.env` file:

**Change this:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lioarcade?schema=public"
```

**To this (add `&sslmode=disable`):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lioarcade?schema=public&sslmode=disable"
```

### Quick Fix Steps:

1. Open `backend/.env` file
2. Find the `DATABASE_URL` line
3. Add `&sslmode=disable` at the end (before the closing quote)
4. Save the file
5. Restart your backend server

### Example:

**Before:**
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/lioarcade?schema=public"
```

**After:**
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/lioarcade?schema=public&sslmode=disable"
```

## Why This Happens

- Local PostgreSQL servers typically don't have SSL enabled (it's not needed for localhost)
- Some PostgreSQL clients require SSL by default
- Adding `sslmode=disable` tells the client to connect without SSL for local development

## Important Notes

⚠️ **Only disable SSL for LOCAL development!**

- ✅ **Local PostgreSQL**: Use `sslmode=disable`
- ✅ **Cloud databases** (Railway, Supabase, Neon): Use `sslmode=require` (as provided by their connection strings)

## Test Connection

After updating, test the connection:

```bash
cd backend
npm run db:push
```

You should see:
```
✔ Database schema pushed successfully
```

If you still get errors, verify:
1. PostgreSQL service is running
2. Database `lioarcade` exists
3. Username and password in DATABASE_URL are correct
4. Port 5432 is correct (default PostgreSQL port)




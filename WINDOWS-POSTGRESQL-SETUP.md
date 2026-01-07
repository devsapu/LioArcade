# Windows PostgreSQL Setup - Fix psql Command Not Found

## Problem
PostgreSQL service is running, but `psql` command is not recognized in PowerShell.

## Solution: Add PostgreSQL to PATH

### Step 1: Find PostgreSQL Installation Location

PostgreSQL is typically installed in one of these locations:
- `C:\Program Files\PostgreSQL\18\bin` (for version 18)
- `C:\Program Files\PostgreSQL\16\bin` (for version 16)
- `C:\Program Files\PostgreSQL\15\bin` (for version 15)
- `C:\Program Files\PostgreSQL\14\bin` (for version 14)

**Check which version you have:**
1. Open File Explorer
2. Navigate to `C:\Program Files\PostgreSQL\`
3. Look for folders like `18`, `16`, `15`, `14`, etc.
4. Note the version number

### Step 2: Add PostgreSQL to PATH (Permanent Fix)

#### Method A: Using Windows Settings (Easiest)

1. Press `Win + X` and select **System**
2. Click **Advanced system settings** (on the right)
3. Click **Environment Variables** button
4. Under **System variables**, find and select **Path**
5. Click **Edit**
6. Click **New**
7. Add: `C:\Program Files\PostgreSQL\18\bin` (replace `18` with your version)
8. Click **OK** on all dialogs
9. **Close and reopen PowerShell** for changes to take effect

#### Method B: Using PowerShell (Quick Fix for Current Session)

Open PowerShell and run:
```powershell
# Replace 18 with your PostgreSQL version
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

**Note:** This only works for the current PowerShell session. Use Method A for permanent fix.

#### Method C: Using Command Prompt (Admin)

1. Press `Win + X` → **Command Prompt (Admin)** or **PowerShell (Admin)**
2. Run:
```cmd
setx PATH "%PATH%;C:\Program Files\PostgreSQL\18\bin" /M
```
(Replace `18` with your version)

3. Close and reopen PowerShell

### Step 3: Verify psql Works

After adding to PATH, close and reopen PowerShell, then test:
```powershell
psql --version
```

You should see:
```
psql (PostgreSQL) 18.x
```

## Alternative: Use Full Path (No PATH Changes Needed)

If you don't want to modify PATH, you can use the full path directly:

```powershell
# Replace 18 with your version
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
```

## Connect to Database Using Full Path

```powershell
# Connect to PostgreSQL
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

# Or connect directly to database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lioarcade
```

## Quick Database Setup (Using Full Path)

If you haven't created the database yet:

```powershell
# Connect as postgres user
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

# Then in psql prompt:
CREATE DATABASE lioarcade;
\q
```

## For Backend Setup (No psql Needed!)

**Good news:** You don't actually need `psql` command to set up the backend! Prisma will handle everything.

### Just use Prisma commands:

```powershell
cd backend

# This will create tables automatically
npm run db:push
```

Prisma will:
- Connect to your database using the DATABASE_URL
- Create all tables automatically
- Set up relationships
- No need for manual SQL commands!

## Verify PostgreSQL is Running

Since you can see it in Services, PostgreSQL is running. To verify:

1. Open **Services** (Win+R → `services.msc`)
2. Find **postgresql-x64-18** (or your version)
3. Status should be **Running**
4. Startup Type should be **Automatic**

## Test Database Connection from Backend

Once you have your `.env` file set up correctly:

```powershell
cd backend

# Test connection
npm run db:push
```

If successful, you'll see:
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

## Common PostgreSQL Installation Paths

- **Version 18**: `C:\Program Files\PostgreSQL\18\bin`
- **Version 16**: `C:\Program Files\PostgreSQL\16\bin`
- **Version 15**: `C:\Program Files\PostgreSQL\15\bin`
- **Version 14**: `C:\Program Files\PostgreSQL\14\bin`

## Find Your PostgreSQL Version

1. Open **Services** (Win+R → `services.msc`)
2. Look for service name: `postgresql-x64-XX` (XX is your version)
3. Or check folder: `C:\Program Files\PostgreSQL\`

---

## Summary: You Don't Need psql!

**For this project, you can skip psql entirely:**

1. ✅ PostgreSQL service is running (you confirmed this)
2. ✅ Create `.env` file with DATABASE_URL
3. ✅ Run `npm run db:push` - Prisma handles everything!

The `psql` command is only needed if you want to manually run SQL commands. Prisma will do all the database setup for you automatically!




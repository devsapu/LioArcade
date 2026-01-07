# Automation Scripts Guide

This project includes PowerShell scripts to automate setup and running of the application.

## Available Scripts

### 1. `setup.ps1` - Initial Setup (Run Once)

**Purpose:** Sets up the project for the first time.

**What it does:**
- ✅ Checks prerequisites (Node.js, npm, PostgreSQL)
- ✅ Installs backend dependencies
- ✅ Installs frontend dependencies
- ✅ Creates backend `.env` file with auto-generated JWT secrets
- ✅ Creates frontend `.env.local` file
- ✅ Generates Prisma Client
- ✅ Optionally pushes database schema

**Usage:**
```powershell
.\setup.ps1
```

**After running:**
1. Edit `backend/.env` and set your `DATABASE_URL` with correct password
2. If database wasn't pushed, run: `cd backend && npm run db:push`
3. Run `start.ps1` to start the application

---

### 2. `start.ps1` - Start Application (Recommended)

**Purpose:** Starts both backend and frontend in separate windows.

**What it does:**
- ✅ Checks if dependencies are installed
- ✅ Checks if ports are available
- ✅ Starts backend in a new PowerShell window
- ✅ Starts frontend in a new PowerShell window

**Usage:**
```powershell
.\start.ps1
```

**Features:**
- Each server runs in its own window
- Easy to see logs from each server
- Close windows individually to stop servers

---

### 3. `start-single.ps1` - Start in Single Window

**Purpose:** Starts both servers in the same terminal using background jobs.

**Usage:**
```powershell
.\start-single.ps1
```

**Features:**
- Both servers run in the same terminal
- Logs are interleaved with [BACKEND] and [FRONTEND] prefixes
- Press Ctrl+C to stop both servers

**Note:** Less recommended as logs can be harder to read.

---

### 4. `stop.ps1` - Stop All Servers

**Purpose:** Stops all running backend and frontend servers.

**Usage:**
```powershell
.\stop.ps1
```

**What it does:**
- Kills processes on ports 3000 and 3001
- Stops any background jobs
- Useful if servers are stuck or you forgot to close windows

---

## Quick Start Guide

### First Time Setup:
```powershell
# 1. Run setup script
.\setup.ps1

# 2. Edit backend/.env and set DATABASE_URL
# (Open backend/.env in your editor)

# 3. Push database schema (if not done during setup)
cd backend
npm run db:push
cd ..

# 4. Start the application
.\start.ps1
```

### Daily Development:
```powershell
# Just start the servers
.\start.ps1

# When done, close the PowerShell windows or run:
.\stop.ps1
```

---

## Script Details

### setup.ps1 Features:
- Auto-generates secure JWT secrets
- Checks for PostgreSQL installation
- Validates prerequisites
- Creates all necessary config files
- Interactive database setup

### start.ps1 Features:
- Port conflict detection
- Dependency check
- Separate windows for each server
- Clear status messages

### stop.ps1 Features:
- Finds and kills processes on ports 3000/3001
- Cleans up background jobs
- Safe to run multiple times

---

## Troubleshooting

### "Script execution is disabled"
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Port already in use"
Run `.\stop.ps1` to kill existing servers, then try again.

### "Dependencies not installed"
Run `.\setup.ps1` again or manually:
```powershell
cd backend && npm install
cd ../frontend && npm install
```

### Scripts don't work
Make sure you're running PowerShell (not Command Prompt):
- PowerShell has blue background
- Command Prompt has black background
- Or run: `powershell` in Command Prompt

---

## Manual Commands (If Scripts Don't Work)

### Setup:
```powershell
cd backend
npm install
# Create .env file manually
npm run db:generate
npm run db:push

cd ../frontend
npm install
# Create .env.local file manually
```

### Start:
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

---

## Tips

1. **First time:** Always run `setup.ps1` first
2. **Daily use:** Just run `start.ps1`
3. **Port conflicts:** Use `stop.ps1` to clean up
4. **Separate windows:** Use `start.ps1` for better log visibility
5. **Single window:** Use `start-single.ps1` if you prefer

---

**Happy Coding! 🚀**




# 🚨 URGENT: Fix Database Connection for Vercel

## Problem
Your app is trying to use SQLite on Vercel, which doesn't work because:
- Vercel is serverless (no persistent file system)
- SQLite files can't be accessed in serverless functions

## Solution: Switch to PostgreSQL

### Step 1: Set Up Vercel Postgres Database

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Find your deployed project** and click on it
3. **Go to Storage tab** → Click "Create Database"
4. **Select "Postgres"** → Choose a name (e.g., "cocoa-reader-db")
5. **Copy the connection string** (it looks like `postgresql://user:pass@host:port/db`)

### Step 2: Configure Environment Variables

In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
DATABASE_URL = your-postgres-connection-string-from-step-1
NEXTAUTH_SECRET = generate-a-random-32-char-string
NEXTAUTH_URL = https://your-app-name.vercel.app
```

### Step 3: Redeploy

The code is already configured for PostgreSQL. Just redeploy:

1. **Trigger a new deployment**:
   - Go to your Vercel project
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment

OR push a small change to GitHub:

```bash
cd /Users/pc/Documents/Escritorio/github/cocoa-reader-next
git add .
git commit -m "Fix database configuration for Vercel"
git push origin main
```

### Step 4: Initialize Database

After successful deployment:
1. Visit your app URL
2. The database tables will be automatically created
3. Try adding an article to test

## Alternative: Quick Test with Different Deployment

If you want to test locally first:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from local machine
vercel --prod
```

## Generate NEXTAUTH_SECRET

Run this to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

---

## Expected Result

After these changes:
- ✅ Database will persist between deployments
- ✅ No more "Unable to open database file" errors
- ✅ Full production-ready setup
- ✅ Scalable for multiple users

## Quick Check

Your current schema is now PostgreSQL-ready. The connection should work once you:
1. Set up Vercel Postgres database
2. Add the DATABASE_URL environment variable
3. Redeploy

# 🚀 Complete Vercel Deployment Guide with Marketplace Database

## Step 1: Set Up PostgreSQL Database via Marketplace

### Using Vercel Dashboard:

1. **Go to your Vercel project dashboard**
2. **Navigate to Storage tab** or **Marketplace**
3. **Find PostgreSQL** in the marketplace
4. **Click "Add" or "Install"**
5. **Follow the setup wizard**:
   - Choose a database name: `cocoa-reader-db`
   - Select your preferred region (closest to your users)
   - Choose the plan (Hobby plan is fine for testing)

### Alternative: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (run from your project directory)
vercel link

# Add PostgreSQL database
vercel env add DATABASE_URL
# When prompted, paste your PostgreSQL connection string
```

## Step 2: Configure Environment Variables

After creating the database, Vercel will provide you with a connection string. Add these environment variables in your Vercel project:

### In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-32-character-random-secret
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Generate NEXTAUTH_SECRET:
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

## Step 3: Deploy with Database

Your code is already configured for PostgreSQL deployment. The deployment will automatically:

1. **Generate Prisma Client** during build
2. **Create database tables** on first run
3. **Handle database connections** properly

### Trigger Deployment:

**Option A: Push to GitHub (Automatic)**
```bash
cd /Users/pc/Documents/Escritorio/github/cocoa-reader-next
git add .
git commit -m "Ready for production deployment with PostgreSQL"
git push origin main
```

**Option B: Manual Deploy via CLI**
```bash
vercel --prod
```

## Step 4: Verify Deployment

After deployment:

1. **Visit your app URL** (provided by Vercel)
2. **Test adding an article**:
   - Try: `https://www.bbc.com/news` (any news article)
   - The app should extract and save the content
3. **Check database persistence**:
   - Add an article
   - Refresh the page
   - Article should still be there

## Database Schema Overview

Your PostgreSQL database will have this structure:

```sql
-- Articles table with AI processing capabilities
CREATE TABLE "Article" (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  excerpt TEXT,
  cleanedHTML TEXT NOT NULL,
  textContent TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  scroll INTEGER DEFAULT 0,
  
  -- AI Processing fields
  summary TEXT,
  keyPoints TEXT,
  readingTime INTEGER,
  sentiment TEXT,
  primaryCategory TEXT,
  categories TEXT,
  tags TEXT,
  lastProcessed TIMESTAMP
);
```

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL is correctly set
   - Ensure database is created in Vercel marketplace
   - Verify connection string format

2. **Build Fails**
   - Check Prisma client generation
   - Ensure all dependencies are in package.json
   - Review build logs in Vercel dashboard

3. **Function Timeout**
   - Article processing takes time
   - Current timeout is 30 seconds (configured in vercel.json)
   - For longer articles, processing might need optimization

### Checking Logs:
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. View real-time logs and errors

## Production Features Enabled

✅ **Persistent Database** - PostgreSQL with full ACID compliance  
✅ **Serverless Functions** - Auto-scaling API routes  
✅ **CDN Distribution** - Global edge caching  
✅ **SSL Certificate** - Automatic HTTPS  
✅ **Custom Domain** - Add your own domain  
✅ **Analytics** - Built-in performance monitoring  
✅ **Cron Jobs** - Scheduled cleanup tasks  

## Next Steps After Deployment

1. **Add Custom Domain** (optional)
   - Go to Vercel Dashboard → Domains
   - Add your custom domain

2. **Enable Analytics**
   - Install Vercel Analytics package
   - Monitor user engagement

3. **Set Up Monitoring**
   - Check function performance
   - Monitor database usage

4. **Scale Configuration**
   - Upgrade database plan if needed
   - Optimize function memory/timeout

## Cost Considerations

- **Vercel Hobby Plan**: Free for personal projects
- **PostgreSQL**: Check marketplace pricing
- **Bandwidth**: Vercel includes generous limits
- **Function Invocations**: Monitor usage in dashboard

---

## Expected Result

After following these steps:
- ✅ App deployed at `https://your-app-name.vercel.app`
- ✅ PostgreSQL database with persistent storage
- ✅ Full article processing capabilities
- ✅ PWA features working
- ✅ Dark mode and responsive design
- ✅ Production-ready performance

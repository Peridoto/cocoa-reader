# 🚀 Vercel Deployment Guide for Cocoa Reader

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: Choose between SQLite (testing) or PostgreSQL (production)

## Deployment Options

### Option A: Quick Deploy with SQLite (Testing Only)

> ⚠️ **Note**: SQLite files don't persist on Vercel. Data will be lost on each deployment.

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

### Option B: Production Deploy with PostgreSQL (Recommended)

1. **Setup Vercel Postgres**:
   - After importing your project, go to your Vercel dashboard
   - Click on your project → "Storage" tab
   - Click "Create Database" → "Postgres"
   - Copy the connection string

2. **Update Prisma Schema**:
   ```bash
   # Replace your current schema with the PostgreSQL version
   cp prisma/schema.vercel.prisma prisma/schema.prisma
   ```

3. **Environment Variables**:
   In your Vercel project dashboard:
   - Go to Settings → Environment Variables
   - Add these variables:
   
   ```
   DATABASE_URL=your-vercel-postgres-connection-string
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Configure for PostgreSQL deployment"
   git push origin main
   ```

## Manual Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

1. **Database Migration** (PostgreSQL only):
   - Go to your Vercel dashboard
   - Navigate to Functions → View Function Logs
   - The first deployment will automatically run migrations

2. **Test Your App**:
   - Visit your deployed URL
   - Try adding an article
   - Test the read-later functionality

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for sessions | Recommended |
| `NEXTAUTH_URL` | Your app's production URL | Recommended |

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Database Connection**: Ensure `DATABASE_URL` is correctly set
3. **Function Timeout**: Increase timeout in `vercel.json`

### Logs:
- View deployment logs in Vercel dashboard
- Check function logs for runtime errors

## Production Considerations

1. **Database**: Use PostgreSQL for production
2. **Environment Variables**: Keep secrets secure
3. **Analytics**: Enable Vercel Analytics for insights
4. **Domain**: Add custom domain in Vercel settings

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

---

Your Cocoa Reader app will be deployed with:
- ✅ Server-side rendering
- ✅ API routes for article processing
- ✅ PWA capabilities
- ✅ Responsive design
- ✅ Dark mode support

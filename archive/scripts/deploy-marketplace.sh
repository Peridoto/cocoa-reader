#!/bin/bash

echo "🚀 Cocoa Reader - Vercel Marketplace Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

echo "✅ Found package.json"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Login check
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

echo "✅ Authenticated with Vercel"

# Link project
echo "🔗 Linking project..."
vercel link

echo ""
echo "📋 Next Steps for Database Setup:"
echo "=================================="
echo ""
echo "1. 🗄️  Set up PostgreSQL Database:"
echo "   → Go to https://vercel.com/dashboard"
echo "   → Find your project → Storage/Marketplace tab"
echo "   → Add PostgreSQL database"
echo "   → Copy the connection string"
echo ""
echo "2. 🔧 Configure Environment Variables:"
echo "   → In Vercel dashboard: Settings → Environment Variables"
echo "   → Add: DATABASE_URL=your-postgres-connection-string"
echo "   → Add: NEXTAUTH_SECRET=\$(openssl rand -base64 32)"
echo "   → Add: NEXTAUTH_URL=https://your-app-name.vercel.app"
echo ""
echo "3. 🚀 Deploy:"
echo "   → Run: vercel --prod"
echo "   → Or push to GitHub for automatic deployment"
echo ""

read -p "Have you set up the PostgreSQL database in Vercel Marketplace? (y/n): " db_ready

if [ "$db_ready" = "y" ] || [ "$db_ready" = "Y" ]; then
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📝 Check your deployment at the URL provided above"
    echo "🧪 Test by adding an article to verify database connectivity"
else
    echo ""
    echo "⏸️  Please complete the database setup first:"
    echo "   1. Visit: https://vercel.com/dashboard"
    echo "   2. Go to your project → Storage/Marketplace"
    echo "   3. Add PostgreSQL database"
    echo "   4. Configure environment variables"
    echo "   5. Run this script again"
fi

echo ""
echo "📚 For detailed instructions, see: VERCEL_MARKETPLACE_SETUP.md"

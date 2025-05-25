#!/bin/zsh

echo "🎉 Setting up Prisma Database connection for Vercel"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

echo "✅ Found package.json"

echo ""
echo "📋 Next Steps to Connect Your Prisma Database:"
echo ""
echo "1. 🔑 Get Your Database Connection String:"
echo "   - Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "   - Click on your project"
echo "   - Go to Storage tab"
echo "   - Click on your 'Prisma Database'"
echo "   - Copy the connection string (starts with postgresql://)"
echo ""

echo "2. 🔧 Set Environment Variables:"
echo "   In your Vercel project dashboard:"
echo "   - Go to Settings → Environment Variables"
echo "   - Add these variables:"
echo ""
echo "   DATABASE_URL = [your-connection-string-from-step-1]"
echo "   NEXTAUTH_SECRET = $(openssl rand -base64 32)"
echo ""

echo "3. 🚀 Deploy:"
echo "   - Your code is already configured for PostgreSQL"
echo "   - Just redeploy your project in Vercel"
echo "   - Or push any change to trigger deployment:"
echo ""
echo "   git add ."
echo "   git commit -m 'Connect to Prisma Database'"
echo "   git push origin main"
echo ""

echo "4. ✅ Test:"
echo "   - Visit your deployed app"
echo "   - Try adding an article"
echo "   - Data will now persist!"
echo ""

echo "🔗 Quick Links:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Your GitHub Repo: https://github.com/Peridoto/cocoa-reader"
echo ""

# Generate a random secret for convenience
echo "🔐 Generated NEXTAUTH_SECRET for you:"
echo "$(openssl rand -base64 32)"
echo ""
echo "(Copy this for your environment variables)"

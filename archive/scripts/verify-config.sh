#!/bin/zsh

echo "🔍 Verifying Prisma Database Configuration"
echo "========================================="

# Check Prisma schema
if grep -q "postgresql" prisma/schema.prisma; then
    echo "✅ Prisma schema configured for PostgreSQL"
else
    echo "❌ Prisma schema not configured for PostgreSQL"
    exit 1
fi

# Check if DATABASE_URL is referenced
if grep -q "env(\"DATABASE_URL\")" prisma/schema.prisma; then
    echo "✅ DATABASE_URL environment variable referenced"
else
    echo "❌ DATABASE_URL not found in schema"
    exit 1
fi

# Check package.json for proper build script
if grep -q "prisma generate" package.json; then
    echo "✅ Build script includes Prisma generation"
else
    echo "❌ Build script missing Prisma generation"
    exit 1
fi

# Check vercel.json configuration
if [ -f "vercel.json" ]; then
    echo "✅ Vercel configuration file exists"
else
    echo "❌ vercel.json not found"
    exit 1
fi

echo ""
echo "🎯 Configuration Status: READY FOR DEPLOYMENT"
echo ""
echo "📋 What you need to do next:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click on your project"
echo "3. Go to Storage → Click 'Prisma Database'"
echo "4. Copy the connection string"
echo "5. Go to Settings → Environment Variables"
echo "6. Add: DATABASE_URL = [your-connection-string]"
echo "7. Add: NEXTAUTH_SECRET = Tmx3lCqNsD9Q0a0i9/jqp60NiwgruTHSnE/51Pc1fJA="
echo "8. Redeploy your project"
echo ""
echo "✨ Your app will then work with persistent PostgreSQL storage!"

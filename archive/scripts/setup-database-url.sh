#!/bin/zsh

echo "🎯 Setting up Prisma Accelerate Database for Vercel"
echo "=================================================="

# Database connection string (keep this secure!)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKVzNTMzlXNzdEWkVSUlRWR1Y2SjJWQ0YiLCJ0ZW5hbnRfaWQiOiJhMzNmMmMwYjE4ZWY0MDhjOTE0MjliYmM3MWMxMDZhMzk0MDA4YjIxMDg5ZmY1MDhkOTE0OTNkN2QyMTFjNGQwIiwiaW50ZXJuYWxfc2VjcmV0IjoiYWRmYjcxZDYtMzQ2Yy00ZWEzLWE2ZjEtYmMxMDc4YTQwZDdiIn0.76vk04jSzh3mZLrMKL3tm78w7TVK3TdE3laBcggwABo"

# Generate a secure NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "✅ Database URL: Ready"
echo "✅ NextAuth Secret: Generated"
echo ""

echo "📋 COPY THESE ENVIRONMENT VARIABLES TO VERCEL:"
echo "============================================="
echo ""
echo "DATABASE_URL="
echo "$DATABASE_URL"
echo ""
echo "NEXTAUTH_SECRET="
echo "$NEXTAUTH_SECRET"
echo ""

echo "📋 STEPS TO ADD TO VERCEL:"
echo "========================="
echo ""
echo "1. 🌐 Go to: https://vercel.com/dashboard"
echo "2. 📁 Click on your Cocoa Reader project"
echo "3. ⚙️  Go to Settings → Environment Variables"
echo "4. ➕ Click 'Add New'"
echo "5. 📝 Add the first variable:"
echo "   Name: DATABASE_URL"
echo "   Value: [copy the DATABASE_URL from above]"
echo "6. ➕ Click 'Add New' again"
echo "7. 📝 Add the second variable:"
echo "   Name: NEXTAUTH_SECRET"
echo "   Value: [copy the NEXTAUTH_SECRET from above]"
echo "8. 💾 Save both variables"
echo "9. 🚀 Go to Deployments → Click 'Redeploy' on latest"
echo ""

echo "🎉 THAT'S IT! Your app will then work with persistent storage!"
echo ""

echo "🔍 Quick Test After Deployment:"
echo "1. Visit your deployed app URL"
echo "2. Try adding an article (paste any news URL)"
echo "3. The article should save and persist!"
echo ""

echo "🔗 Quick Links:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Your Repo: https://github.com/Peridoto/cocoa-reader"

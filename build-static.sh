#!/bin/bash

echo "🚀 Building static version of Cocoa Reader (preserving your actual app)..."

# Backup current files
echo "📦 Backing up dynamic files..."
cp next.config.js next.config.dynamic.js.bak 2>/dev/null || true

# Setup static configuration (keep your actual pages)
echo "🔧 Setting up static configuration..."
cp next.config.static.js next.config.js

# Temporarily remove API routes and read pages (they don't work in static)
echo "📁 Temporarily moving dynamic routes..."
mv src/app/api src/api-backup 2>/dev/null || true
mv src/app/read src/read-backup 2>/dev/null || true

# Build static version with your actual app
echo "🏗️  Building static export..."
pnpm build

# Restore dynamic files  
echo "🔄 Restoring dynamic files..."
mv src/api-backup src/app/api 2>/dev/null || true
mv src/read-backup src/app/read 2>/dev/null || true
cp next.config.dynamic.js.bak next.config.js 2>/dev/null || true

echo "✅ Static build complete!"
echo "📂 Static files are in the 'out' directory"
echo "🌐 Upload the contents of 'out' directory to your web server"
echo ""
echo "The main files you need are:"
echo "  - out/index.html (your actual Cocoa Reader app)"
echo "  - out/_next/ (static assets)"
echo "  - out/status/ (status page)"
echo "  - out/debug/ (debug page)"  
echo "  - out/test/ (test page)"
echo ""
echo "📋 STATIC BUILD FUNCTIONALITY:"
echo "✅ Main app interface with demo articles"
echo "✅ Responsive design and dark mode"
echo "✅ Form validation and UI interactions"
echo "✅ Theme toggling and settings menu"
echo "✅ Search and filter interface (demo mode)"
echo "✅ Article card display with AI summary mockups"
echo ""
echo "⚠️  LIMITATIONS IN STATIC MODE:"
echo "❌ Cannot save real articles (no backend API)"
echo "❌ Cannot access individual article reading pages (/read/[id])"
echo "❌ Cannot process articles with AI (no backend)"
echo "❌ Cannot export/import articles (no database)"
echo ""
echo "🚀 FOR FULL FUNCTIONALITY:"
echo "Deploy the complete Next.js app to a platform like Vercel, Netlify Functions, or any Node.js hosting"
echo ""
echo "⚠️  Note: Your app will detect static mode automatically and show"
echo "    demo articles instead of trying to call the API routes."

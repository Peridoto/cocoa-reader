#!/bin/bash

# Clear Next.js cache and force reload
echo "🔄 Clearing Next.js cache and forcing reload..."

cd /Users/pc/Documents/Escritorio/github/cocoa-readerweb

# Stop any running dev servers
echo "🛑 Stopping development servers..."
pkill -f "next dev" || true

# Clear Next.js cache
echo "🗑️ Clearing .next cache..."
rm -rf .next

# Clear node_modules cache (optional, but thorough)
echo "📦 Clearing node_modules cache..."
rm -rf node_modules/.cache

# Restart development server
echo "🚀 Starting fresh development server..."
npm run dev

echo "✅ Cache cleared and server restarted!"
echo "📱 Open http://localhost:3000 in your browser"
echo "💡 Use Ctrl+Shift+R (or Cmd+Shift+R on Mac) to force browser refresh"

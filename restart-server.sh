#!/bin/bash

# Navigate to project directory
cd /Users/pc/Documents/Escritorio/github/cocoaReader

echo "🚀 Starting Cocoa Reader..."
echo "📂 Working directory: $(pwd)"

# Check Node.js version
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

# Check if .next directory exists (built app)
if [ -d ".next" ]; then
    echo "🗑️  Cleaning previous build..."
    rm -rf .next
fi

# Kill any existing process on port 3000
echo "🔍 Checking for existing processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Killing existing process..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
fi

# Start development server
echo "🌐 Starting Next.js development server..."
echo "🔗 Server will be available at: http://localhost:3000"
echo ""

npm run dev

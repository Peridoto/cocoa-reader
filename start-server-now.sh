#!/bin/zsh

echo "🚀 Starting Cocoa Reader Development Server"
echo "==========================================="

# Navigate to project directory
cd /Users/pc/Documents/Escritorio/github/cocoaReader

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    echo "Please run this from: /Users/pc/Documents/Escritorio/github/cocoaReader"
    exit 1
fi

echo "✅ Found package.json"

# Check Node.js
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Kill any existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Killing existing process on port 3000..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
else
    echo "✅ Port 3000 is available"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

# Start the development server
echo ""
echo "🌐 Starting Next.js development server..."
echo "🔗 Server will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev

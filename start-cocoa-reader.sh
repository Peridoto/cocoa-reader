#!/bin/zsh

echo "🚀 Starting Cocoa Reader Development Server"
echo "==========================================="

# Navigate to project directory
cd /Users/pc/Documents/Escritorio/github/cocoaReader

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

echo "✅ Found package.json"

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
    echo "📦 Using pnpm (detected pnpm-lock.yaml)"
elif [ -f "package-lock.json" ]; then
    PKG_MANAGER="npm"
    echo "📦 Using npm (detected package-lock.json)"
else
    PKG_MANAGER="npm"
    echo "📦 Using npm (default)"
fi

# Check versions
echo "📦 Node.js version: $(node --version)"
if command -v $PKG_MANAGER &> /dev/null; then
    echo "📦 $PKG_MANAGER version: $($PKG_MANAGER --version)"
else
    echo "❌ $PKG_MANAGER not found!"
    exit 1
fi

# Kill any existing processes on port 3000
echo "🔍 Checking for existing processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Killing existing process on port 3000..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
    echo "✅ Port 3000 cleared"
else
    echo "✅ Port 3000 is available"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies with $PKG_MANAGER..."
    $PKG_MANAGER install
else
    echo "✅ Dependencies found"
fi

# Clear any build cache
if [ -d ".next" ]; then
    echo "🗑️  Clearing Next.js cache..."
    rm -rf .next
fi

# Generate Prisma client if needed
if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️  Generating Prisma client..."
    npx prisma generate
fi

# Start the development server
echo ""
echo "🌐 Starting Next.js development server..."
echo "🔗 Server will be available at: http://localhost:3000"
echo "📝 Press Ctrl+C to stop the server"
echo ""

# Start the server with the detected package manager
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm dev
else
    npm run dev
fi

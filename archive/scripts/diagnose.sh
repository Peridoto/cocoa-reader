#!/bin/bash

echo "🔍 COCOA READER DIAGNOSTIC SCRIPT"
echo "=================================="
echo ""

# Check current directory
echo "📂 Current directory: $(pwd)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Check Node.js and npm versions
echo "📦 Node.js version: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "📦 npm version: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo ""

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    # Count installed packages
    package_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "📦 Found $package_count packages"
else
    echo "❌ node_modules directory NOT found"
    echo "🔧 Run: npm install"
fi
echo ""

# Check key files
echo "📁 Checking key files:"
files=("src/app/page.tsx" "src/app/layout.tsx" "package.json" "next.config.js" "tsconfig.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done
echo ""

# Check if port 3000 is in use
echo "🔍 Checking port 3000:"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is OCCUPIED by:"
    lsof -i :3000
else
    echo "✅ Port 3000 is available"
fi
echo ""

# Check for TypeScript errors
echo "🔍 Checking for TypeScript errors:"
if command -v npx > /dev/null 2>&1; then
    echo "Running TypeScript check..."
    if npx tsc --noEmit --skipLibCheck 2>&1; then
        echo "✅ No TypeScript errors found"
    else
        echo "❌ TypeScript errors detected (see above)"
    fi
else
    echo "⚠️  npx not found, skipping TypeScript check"
fi
echo ""

# Try to build the project
echo "🏗️  Testing Next.js build:"
if command -v npx > /dev/null 2>&1; then
    echo "Building project..."
    if npx next build 2>&1; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed (see above)"
    fi
else
    echo "⚠️  npx not found, skipping build test"
fi
echo ""

echo "🚀 RECOMMENDED ACTIONS:"
echo "======================"
echo "1. If node_modules missing: npm install"
echo "2. If TypeScript errors: Fix the errors shown above"
echo "3. If build fails: Check the error messages above"
echo "4. If port occupied: Kill the process or use a different port"
echo "5. Start dev server: npm run dev"
echo "6. Open browser: http://localhost:3000"
echo ""
echo "If issues persist, the problem might be:"
echo "- Network/firewall blocking localhost"
echo "- Browser cache issues (try incognito mode)"
echo "- VS Code Simple Browser issues (try external browser)"

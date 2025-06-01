#!/bin/zsh

echo "🔍 COCOA READER TROUBLESHOOTING"
echo "==============================="

cd /Users/pc/Documents/Escritorio/github/cocoaReader

# Basic checks
echo "📂 Current directory: $(pwd)"
echo "📦 Node.js: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "📦 npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "📦 pnpm: $(pnpm --version 2>/dev/null || echo 'NOT FOUND')"

# Check key files
echo ""
echo "📁 Key files:"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f "next.config.js" ] && echo "✅ next.config.js" || echo "❌ next.config.js"
[ -f "tsconfig.json" ] && echo "✅ tsconfig.json" || echo "❌ tsconfig.json"
[ -d "src" ] && echo "✅ src/" || echo "❌ src/"
[ -f "src/app/page.tsx" ] && echo "✅ src/app/page.tsx" || echo "❌ src/app/page.tsx"
[ -f "src/app/layout.tsx" ] && echo "✅ src/app/layout.tsx" || echo "❌ src/app/layout.tsx"

# Check dependencies
echo ""
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "   └── $(ls node_modules | wc -l | tr -d ' ') packages installed"
else
    echo "❌ node_modules missing - run install command"
fi

# Check lock files
echo ""
echo "🔒 Lock files:"
[ -f "package-lock.json" ] && echo "✅ package-lock.json (npm)" || echo "❌ package-lock.json"
[ -f "pnpm-lock.yaml" ] && echo "✅ pnpm-lock.yaml (pnpm)" || echo "❌ pnpm-lock.yaml"

# Check port
echo ""
echo "🔍 Port 3000 status:"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is OCCUPIED:"
    lsof -i :3000
else
    echo "✅ Port 3000 is available"
fi

# Try to compile TypeScript
echo ""
echo "🔍 TypeScript check:"
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo "✅ No TypeScript errors"
else
    echo "❌ TypeScript errors found:"
    npx tsc --noEmit --skipLibCheck
fi

echo ""
echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. If node_modules missing: npm install (or pnpm install)"
echo "2. If TypeScript errors: fix the errors above"
echo "3. If port occupied: kill -9 \$(lsof -ti:3000)"
echo "4. Start server: ./start-cocoa-reader.sh"
echo "5. Open: http://localhost:3000"

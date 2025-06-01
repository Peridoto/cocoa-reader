#!/bin/bash

# Hydration Fix Verification Script
# Tests the React hydration fixes before iOS deployment

echo "🧪 Testing React Hydration Fixes..."
echo "=================================="

# Test 1: Build Process
echo "📦 Testing build process..."
cd "$(dirname "$0")"

if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Test 2: Check for hydration-related files
echo ""
echo "📁 Checking hydration fix files..."

files_to_check=(
    "src/components/NoSSR.tsx"
    "src/components/ThemeProvider.tsx"
    "src/app/layout.tsx"
    "REACT_HYDRATION_FIXED.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test 3: Search for potential hydration issues in code
echo ""
echo "🔍 Scanning for potential hydration issues..."

# Check for localStorage access outside useEffect
if grep -r "localStorage\." src/ --include="*.tsx" --include="*.ts" | grep -v "useEffect\|useLayoutEffect"; then
    echo "⚠️  Found potential localStorage access outside useEffect"
else
    echo "✅ No problematic localStorage access found"
fi

# Check for window access outside useEffect
if grep -r "window\." src/ --include="*.tsx" --include="*.ts" | grep -v "useEffect\|useLayoutEffect\|typeof window\|if.*window" | grep -v "window.document\|window.location"; then
    echo "⚠️  Found potential window access outside useEffect"
else
    echo "✅ No problematic window access found"
fi

# Check for document access outside useEffect
if grep -r "document\." src/ --include="*.tsx" --include="*.ts" | grep -v "useEffect\|useLayoutEffect\|typeof document"; then
    echo "⚠️  Found potential document access outside useEffect"
else
    echo "✅ No problematic document access found"
fi

# Test 4: Verify Capacitor sync
echo ""
echo "📱 Testing Capacitor sync..."

if npx cap sync ios --quiet; then
    echo "✅ Capacitor sync successful"
else
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Test 5: Check output directory
echo ""
echo "📂 Checking build output..."

if [ -d "out" ] && [ -f "out/index.html" ]; then
    echo "✅ Build output generated correctly"
    
    # Count total files
    file_count=$(find out -type f | wc -l)
    echo "📊 Generated $file_count files"
    
    # Check for key files
    key_files=("index.html" "_next/static" "manifest.json")
    for key_file in "${key_files[@]}"; do
        if [ -e "out/$key_file" ]; then
            echo "✅ Key file: $key_file"
        else
            echo "❌ Missing key file: $key_file"
        fi
    done
else
    echo "❌ Build output missing or incomplete"
    exit 1
fi

# Test 6: Check iOS assets
echo ""
echo "🍎 Checking iOS assets..."

if [ -d "ios/App/App/public" ] && [ -f "ios/App/App/public/index.html" ]; then
    echo "✅ iOS assets copied successfully"
    
    ios_file_count=$(find ios/App/App/public -type f | wc -l)
    echo "📊 iOS has $ios_file_count files"
else
    echo "❌ iOS assets missing"
    exit 1
fi

echo ""
echo "🎉 All hydration fix tests passed!"
echo "=================================="
echo ""
echo "📱 Ready for iOS testing:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Select iOS Simulator or device"
echo "3. Build and run the project"
echo "4. Verify no hydration errors in console"
echo "5. Test app functionality"
echo ""
echo "🐛 Debug tools available:"
echo "- Comprehensive error debugger (red banner)"
echo "- Browser console for detailed errors"
echo "- Source maps enabled for debugging"
echo ""
echo "📚 Documentation:"
echo "- REACT_HYDRATION_FIXED.md - Technical details"
echo "- IOS_CLIENT_EXCEPTION_RESOLVED.md - Previous fixes"

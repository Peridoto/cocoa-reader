# 🚀 QUICK START GUIDE

## Start the Development Server

**Option 1: Use the startup script**
```bash
cd /Users/pc/Documents/Escritorio/github/cocoaReader
chmod +x start-dev.sh
./start-dev.sh
```

**Option 2: Manual startup**
```bash
cd /Users/pc/Documents/Escritorio/github/cocoaReader

# Install dependencies if needed
npm install

# Setup database if needed
npx prisma db push
npx prisma db seed

# Start the development server
npm run dev
```

## Expected Output

You should see something like:
```
  ▲ Next.js 14.2.3
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

## Test the Application

Once the server is running, open these URLs:

1. **Main page**: http://localhost:3000
2. **Debug page**: http://localhost:3000/debug  
3. **Status page**: http://localhost:3000/status

## Troubleshooting

**If you see "port already in use":**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npm run dev
```

**If you see module errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**If database errors:**
```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Current Application Status

The application has been simplified to use basic inline styles and should display:
- 🥥 Cocoa Reader heading
- Welcome message
- Green success indicator

This eliminates potential CSS framework issues that might cause white screens.

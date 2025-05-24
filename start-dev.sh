#!/bin/bash

echo "🚀 Starting Cocoa Reader development server..."
echo "📂 Working directory: $(pwd)"

# Check if Next.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Installing dependencies..."
    npm install
fi

# Check if database exists
if [ ! -f "prisma/data/readlater.db" ]; then
    echo "🗄️ Setting up database..."
    npx prisma db push
    npx prisma db seed
fi

# Start the development server
echo "🌐 Starting Next.js development server on http://localhost:3000"
npm run dev

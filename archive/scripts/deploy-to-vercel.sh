#!/bin/bash

echo "🚀 Cocoa Reader - Vercel Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

echo "✅ Found package.json"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check for remote
if ! git remote | grep -q origin; then
    echo "⚠️  No git remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/cocoa-reader.git"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Added remote: $repo_url"
    fi
fi

# Check for .env.example
if [ ! -f ".env.example" ]; then
    echo "❌ Missing .env.example file"
    exit 1
fi

echo "✅ Environment example file found"

# Check if there are uncommitted changes
if ! git diff --quiet; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Prepare for Vercel deployment - $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "🎯 Deployment Options:"
echo "1. Quick Deploy (SQLite - Testing only)"
echo "2. Production Deploy (PostgreSQL - Recommended)"
echo ""
read -p "Choose deployment type (1 or 2): " deploy_type

if [ "$deploy_type" = "2" ]; then
    echo ""
    echo "🗄️  Setting up for PostgreSQL deployment..."
    
    # Copy PostgreSQL schema
    if [ -f "prisma/schema.vercel.prisma" ]; then
        cp prisma/schema.vercel.prisma prisma/schema.prisma
        echo "✅ Updated Prisma schema for PostgreSQL"
        
        # Commit the schema change
        git add prisma/schema.prisma
        git commit -m "Update schema for PostgreSQL deployment"
    fi
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Go to https://vercel.com/new"
    echo "3. Import your repository"
    echo "4. Add PostgreSQL database in Vercel dashboard"
    echo "5. Set environment variables (see .env.example)"
else
    echo ""
    echo "📋 Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Go to https://vercel.com/new"
    echo "3. Import your repository"
    echo "4. Deploy (SQLite will work for testing)"
fi

echo ""
echo "🔗 Useful links:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Deployment Guide: ./VERCEL_DEPLOYMENT.md"
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Ready for Vercel deployment!"
echo "   Visit: https://vercel.com/new"

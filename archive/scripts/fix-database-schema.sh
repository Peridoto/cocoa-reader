#!/bin/bash

# Fix Database Schema - Add Missing aiProcessed Column
# This script will update your production database to match your Prisma schema

echo "🔧 Fixing database schema..."
echo "Adding missing aiProcessed column to Article table..."

# Set the environment variables for production database
export DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKVzNTMzlXNzdEWkVSUlRWR1Y2SjJWQ0YiLCJ0ZW5hbnRfaWQiOiJhMzNmMmMwYjE4ZWY0MDhjOTE0MjliYmM3MWMxMDZhMzk0MDA4YjIxMDg5ZmY1MDhkOTE0OTNkN2QyMTFjNGQwIiwiaW50ZXJuYWxfc2VjcmV0IjoiYWRmYjcxZDYtMzQ2Yy00ZWEzLWE2ZjEtYmMxMDc4YTQwZDciIn0.76vk04jSzh3mZLrMKL3tm78w7TVK3TdE3laBcggwABo"

# Push the schema changes to the database
echo "Pushing schema changes to production database..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
    echo "🚀 Your app should now work correctly on Vercel!"
else
    echo "❌ Error updating database schema."
    echo "📞 You may need to get a fresh database URL from Prisma Accelerate or use Vercel Postgres."
fi

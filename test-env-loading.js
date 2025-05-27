#!/usr/bin/env node

// Quick test to check environment variable loading
console.log('🔍 Environment Variable Test');
console.log('============================');

console.log('Node.js process.env.DATABASE_URL:', process.env.DATABASE_URL);
console.log('All DATABASE_URL related env vars:');

Object.keys(process.env).forEach(key => {
  if (key.includes('DATABASE') || key.includes('URL')) {
    console.log(`  ${key}: ${process.env[key]}`);
  }
});

// Try to load from different env files
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];

envFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📄 Found ${file}:`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.includes('DATABASE_URL'));
    lines.forEach(line => console.log(`  ${line}`));
  }
});

// Test Prisma client initialization
console.log('\n🔧 Testing Prisma Client...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('✅ Prisma Client created successfully');
  
  // Try to connect
  prisma.$connect().then(() => {
    console.log('✅ Database connection successful');
    return prisma.article.count();
  }).then(count => {
    console.log(`✅ Found ${count} articles`);
  }).catch(error => {
    console.log('❌ Database operation failed:', error.message);
  }).finally(() => {
    prisma.$disconnect();
  });
  
} catch (error) {
  console.log('❌ Prisma Client creation failed:', error.message);
}

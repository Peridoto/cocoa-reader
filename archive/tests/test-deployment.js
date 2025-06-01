// Test script to verify deployment configuration
const { PrismaClient } = require('@prisma/client');

async function testDeployment() {
  console.log('🔍 Testing deployment configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log();

  // Test database connection
  console.log('🗄️ Testing database connection...');
  
  try {
    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Simple connection test
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if we can query the schema
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ENOENT') || error.message.includes('database file')) {
      console.log('\n🔧 This suggests the app is still trying to use SQLite instead of PostgreSQL');
      console.log('   Make sure environment variables are properly set in Vercel');
    }
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Verify environment variables are set in Vercel dashboard');
  console.log('2. Trigger a manual redeploy if needed');
  console.log('3. Check deployment logs for any errors');
}

// Set test environment variable if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKVzNTMzlXNzdEWkVSUlRWR1Y2SjJWQ0YiLCJ0ZW5hbnRfaWQiOiJhMzNmMmMwYjE4ZWY0MDhjOTE0MjliYmM3MWMxMDZhMzk0MDA4YjIxMDg5ZmY1MDhkOTE0OTNkN2QyMTFjNGQwIiwiaW50ZXJuYWxfc2VjcmV0IjoiYWRmYjcxZDYtMzQ2Yy00ZWEzLWE2ZjEtYmMxMDc4YTQwZDciIn0.76vk04jSzh3mZLrMKL3tm78w7TVK3TdE3laBcggwABo';
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'wdEB/MIMGh0KdP92kNNcIgrOj9CEojM49ppl1SpOlBg=';
}

testDeployment().catch(console.error);

const { PrismaClient } = require('@prisma/client');

console.log('Testing Prisma connection...');
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    console.log('\nTesting Prisma client initialization...');
    
    // Test basic connection
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    // Test article schema
    console.log('Testing Article table...');
    const count = await prisma.article.count();
    console.log('✅ Article table accessible, count:', count);
    
    // Test findUnique (the specific operation that's failing)
    console.log('Testing findUnique operation...');
    const existing = await prisma.article.findUnique({
      where: { url: 'https://example.com/test' }
    });
    console.log('✅ findUnique operation successful:', existing === null ? 'No article found (expected)' : 'Article found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

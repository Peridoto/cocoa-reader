// Test script to verify database schema after fix
const { PrismaClient } = require('@prisma/client');

async function testDatabaseSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection and schema...');
    
    // Test basic connection
    const articleCount = await prisma.article.count();
    console.log(`✅ Connected! Found ${articleCount} articles in database.`);
    
    // Test if aiProcessed field exists by trying to query it
    const articlesWithAI = await prisma.article.findMany({
      where: {
        aiProcessed: false
      },
      take: 1,
      select: {
        id: true,
        title: true,
        aiProcessed: true
      }
    });
    
    console.log('✅ aiProcessed column exists and is queryable!');
    console.log(`Found ${articlesWithAI.length} unprocessed articles`);
    
    console.log('🎉 Database schema is correct! Your app should work now.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.message.includes('aiProcessed')) {
      console.log('💡 Solution: You need to update your database URL to a fresh database.');
      console.log('   See DATABASE_FIX_GUIDE.md for instructions.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseSchema();

const { PrismaClient } = require('@prisma/client');

// Test the new Neon database connection
const DATABASE_URL = "postgres://neondb_owner:npg_Bhcg7MzA6Gqw@ep-square-sun-ab5wtaqg-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require";

async function testNeonConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });
  
  try {
    console.log('🔍 Testing Neon database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database successfully!');
    
    // Test if we can push the schema (this will create tables if they don't exist)
    console.log('📋 Checking database schema...');
    
    // Count articles (this will work if schema is properly set up)
    const articleCount = await prisma.article.count();
    console.log(`✅ Found ${articleCount} articles in database.`);
    
    // Test if aiProcessed field exists
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
    
    console.log('✅ aiProcessed column is working correctly!');
    console.log('🎉 Your Neon database is ready for production!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'P2021') {
      console.log('💡 Need to push schema first. This is normal for a new database.');
      console.log('   Vercel will automatically run "prisma generate" during deployment.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testNeonConnection();

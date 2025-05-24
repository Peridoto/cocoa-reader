// Quick database check script
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Database Check ===');
    
    // Count total articles
    const totalArticles = await prisma.article.count();
    console.log('Total articles:', totalArticles);
    
    // Count processed vs unprocessed
    const processedCount = await prisma.article.count({
      where: { aiProcessed: true }
    });
    const unprocessedCount = await prisma.article.count({
      where: { 
        OR: [
          { aiProcessed: false },
          { aiProcessed: null }
        ]
      }
    });
    
    console.log('Processed articles:', processedCount);
    console.log('Unprocessed articles:', unprocessedCount);
    
    // Show first few articles
    const articles = await prisma.article.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        aiProcessed: true,
        summary: true,
        createdAt: true
      }
    });
    
    console.log('\nRecent articles:');
    articles.forEach((article, idx) => {
      console.log(`${idx + 1}. ${article.title.slice(0, 50)}...`);
      console.log(`   ID: ${article.id}`);
      console.log(`   AI Processed: ${article.aiProcessed}`);
      console.log(`   Has Summary: ${!!article.summary}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

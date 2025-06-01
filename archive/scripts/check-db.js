const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticles() {
  try {
    const articles = await prisma.article.findMany();
    console.log('Articles in database:', articles.length);
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} - ${article.domain}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();

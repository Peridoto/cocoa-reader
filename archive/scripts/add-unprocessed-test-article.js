const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUnprocessedTestArticle() {
    console.log('🔄 Adding unprocessed test article for UI testing...');
    
    try {
        const article = await prisma.article.create({
            data: {
                url: 'https://example.com/ui-test-article',
                title: 'UI Test Article - Not Processed',
                domain: 'example.com',
                cleanedHTML: '<p>This is a test article that has not been processed by AI yet. It contains enough content to generate a meaningful summary when the AI processing button is clicked.</p><p>The article discusses various topics including technology, development, and user experience design. This content should be sufficient for testing the AI processing functionality through the user interface.</p>',
                textContent: 'This is a test article that has not been processed by AI yet. It contains enough content to generate a meaningful summary when the AI processing button is clicked. The article discusses various topics including technology, development, and user experience design. This content should be sufficient for testing the AI processing functionality through the user interface.',
                excerpt: 'This is a test article that has not been processed by AI yet...',
                read: false,
                // AI fields are null/false to test processing
                aiProcessed: false,
                summary: null,
                keyPoints: null,
                readingTime: null,
                sentiment: null,
                primaryCategory: null,
                categories: null,
                tags: null,
                processedAt: null
            }
        });
        
        console.log('✅ Added unprocessed test article:', {
            id: article.id,
            title: article.title,
            aiProcessed: article.aiProcessed
        });
        
        return article;
    } catch (error) {
        console.error('❌ Error adding test article:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addUnprocessedTestArticle().catch(console.error);

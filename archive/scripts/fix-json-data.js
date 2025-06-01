// Fix any articles with invalid JSON in keyPoints, categories, or tags fields
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixInvalidJSON() {
  try {
    console.log('🔍 Checking for articles with invalid JSON...');
    
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, keyPoints: true, categories: true, tags: true }
    });
    
    let fixedCount = 0;
    
    for (const article of articles) {
      const updates = {};
      let needsUpdate = false;
      
      // Check each JSON field
      for (const field of ['keyPoints', 'categories', 'tags']) {
        const value = article[field];
        
        if (value && typeof value === 'string') {
          const trimmed = value.trim();
          
          // If it looks like it should be JSON but isn't valid
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
              JSON.parse(trimmed);
              // It's valid JSON, no need to fix
            } catch (e) {
              console.log(`🔧 Fixing invalid JSON in article ${article.id} (${article.title?.substring(0, 30)}...) field ${field}`);
              console.log(`   Old value: ${trimmed.substring(0, 100)}...`);
              
              // Convert to valid array format
              if (trimmed.includes(',')) {
                // Try to extract comma-separated values
                const items = trimmed.replace(/[\[\]{}]/g, '').split(',').map(s => s.trim().replace(/['"]/g, ''));
                updates[field] = JSON.stringify(items.filter(s => s.length > 0));
              } else {
                // Single item
                const cleanValue = trimmed.replace(/[\[\]{}'"]/g, '').trim();
                updates[field] = JSON.stringify(cleanValue ? [cleanValue] : []);
              }
              
              console.log(`   New value: ${updates[field]}`);
              needsUpdate = true;
            }
          } else if (trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('{')) {
            // Plain string that should be converted to array
            console.log(`🔧 Converting plain string to JSON array in article ${article.id} field ${field}`);
            console.log(`   Old value: ${trimmed.substring(0, 100)}...`);
            updates[field] = JSON.stringify([trimmed]);
            console.log(`   New value: ${updates[field]}`);
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await prisma.article.update({
          where: { id: article.id },
          data: updates
        });
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} articles with invalid JSON`);
    
    if (fixedCount === 0) {
      console.log('🎉 No articles with invalid JSON found - all data looks good!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing JSON data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInvalidJSON();

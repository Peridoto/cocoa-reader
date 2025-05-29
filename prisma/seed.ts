import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const exampleArticles = [
    {
      url: 'https://example.com/article-1',
      title: 'Welcome to Your Read Later App',
      domain: 'example.com',
      excerpt: 'This is your first saved article. You can now save web pages to read later in a clean, distraction-free environment.',
      cleanedHTML: '<h1>Welcome to Your Read Later App</h1><p>This is your first saved article. You can now save web pages to read later in a clean, distraction-free environment.</p><p>Features include:</p><ul><li>Clean reading experience</li><li>Dark mode support</li><li>Progress tracking</li><li>Offline access</li></ul>',
      textContent: 'Welcome to Your Read Later App\n\nThis is your first saved article. You can now save web pages to read later in a clean, distraction-free environment.\n\nFeatures include:\n- Clean reading experience\n- Dark mode support\n- Progress tracking\n- Offline access',
      read: false,
      favorite: false,
      scroll: 0
    },
    {
      url: 'https://example.com/article-2',
      title: 'How to Use This App',
      domain: 'example.com',
      excerpt: 'Learn how to make the most of your read-later application with these helpful tips and tricks.',
      cleanedHTML: '<h1>How to Use This App</h1><p>Learn how to make the most of your read-later application with these helpful tips and tricks.</p><h2>Adding Articles</h2><p>Simply paste a URL in the input field and click "Save Article" to add it to your reading list.</p><h2>Reading Mode</h2><p>Click the "Read" button to open articles in a clean, focused reading environment.</p>',
      textContent: 'How to Use This App\n\nLearn how to make the most of your read-later application with these helpful tips and tricks.\n\nAdding Articles\nSimply paste a URL in the input field and click "Save Article" to add it to your reading list.\n\nReading Mode\nClick the "Read" button to open articles in a clean, focused reading environment.',
      read: true,
      favorite: false,
      scroll: 75
    }
  ]

  for (const article of exampleArticles) {
    await prisma.article.upsert({
      where: { url: article.url },
      update: {},
      create: article,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

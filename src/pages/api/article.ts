import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { scrapeArticle } from '@/lib/scraper'
import { normalizeUrl } from '@/lib/utils'

const createArticleSchema = z.object({
  url: z.string().min(1, 'URL is required').transform(normalizeUrl).pipe(z.string().url('Invalid URL format')),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', req.body)
      
      const { url } = createArticleSchema.parse(req.body)
      console.log('Parsed and normalized URL:', url)

      // Check if article already exists
      const existingArticle = await prisma.article.findUnique({
        where: { url },
      })

      if (existingArticle) {
        console.log('Article already exists:', url)
        return res.status(409).json({ error: 'Article already exists' })
      }

      console.log('Starting to scrape article:', url)
      // Scrape the article content with ethics compliance
      const scrapingResult = await scrapeArticle(url)
      console.log('Scraping completed ethically, result type:', scrapingResult.permissions.reason)

      // Extract only the content fields for database storage
      const { ethicsCompliant, permissions, ...scrapedContent } = scrapingResult

      // Save to database with ethics compliance info logged
      const article = await prisma.article.create({
        data: {
          url,
          ...scrapedContent,
        },
      })

      // Log different messages for fallback vs successful scraping
      if (scrapingResult.permissions.reason === 'ethics_blocked') {
        console.log('✅ Article saved ethically with fallback content:', article.id)
      } else {
        console.log('✅ Article saved with full scraped content:', article.id)
      }

      return res.status(201).json(article)

    } catch (error) {
      console.error('Error creating article:', error)
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        })
      }

      return res.status(500).json({
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

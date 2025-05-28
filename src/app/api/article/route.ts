import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { scrapeArticle } from '@/lib/scraper'
import { normalizeUrl } from '@/lib/utils'

const createArticleSchema = z.object({
  url: z.string().min(1, 'URL is required').transform(normalizeUrl).pipe(z.string().url('Invalid URL format')),
})

/**
 * POST /api/article - Create a new article by scraping the provided URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { url } = createArticleSchema.parse(body)
    console.log('Parsed and normalized URL:', url)

    // Check if article already exists
    const existingArticle = await prisma.article.findUnique({
      where: { url },
    })

    if (existingArticle) {
      console.log('Article already exists:', url)
      return NextResponse.json(
        { error: 'Article already exists' },
        { status: 409 }
      )
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
    if (permissions.reason.includes('Fallback')) {
      console.log('Fallback article saved successfully:', {
        id: article.id,
        title: article.title,
        reason: permissions.reason
      })
    } else {
      console.log('Article saved successfully with ethics compliance:', {
        id: article.id,
        ethicsCompliant,
        permissions: permissions.reason
      })
    }
    
    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log('Returning error response:', errorMessage)
    return NextResponse.json(
      { error: `Failed to create article: ${errorMessage}` },
      { status: 500 }
    )
  }
}

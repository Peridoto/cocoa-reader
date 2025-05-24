import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for import data
const ImportDataSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  totalArticles: z.number(),
  articles: z.array(z.object({
    url: z.string().url(),
    title: z.string(),
    domain: z.string(),
    excerpt: z.string().optional(),
    cleanedHTML: z.string().optional(),
    textContent: z.string().optional(),
    read: z.boolean().default(false),
    scroll: z.number().default(0)
  })),
  metadata: z.object({
    appName: z.string(),
    appVersion: z.string()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the import data
    const importData = ImportDataSchema.parse(body)
    
    // Check if this is a valid Cocoa Reader export
    if (importData.metadata.appName !== 'Cocoa Reader') {
      return NextResponse.json(
        { error: 'Invalid export file: Not a Cocoa Reader export' },
        { status: 400 }
      )
    }
    
    // Statistics for the import
    let imported = 0
    let skipped = 0
    let errors = 0
    
    // Import articles (skip duplicates based on URL)
    for (const articleData of importData.articles) {
      try {
        await prisma.article.upsert({
          where: { url: articleData.url },
          update: {
            // Update existing article with new data if it has more content
            title: articleData.title,
            excerpt: articleData.excerpt || '',
            cleanedHTML: articleData.cleanedHTML || '',
            textContent: articleData.textContent || '',
            read: articleData.read,
            scroll: articleData.scroll
          },
          create: {
            url: articleData.url,
            title: articleData.title,
            domain: articleData.domain,
            excerpt: articleData.excerpt || '',
            cleanedHTML: articleData.cleanedHTML || '',
            textContent: articleData.textContent || '',
            read: articleData.read,
            scroll: articleData.scroll
          }
        })
        imported++
      } catch (error) {
        console.error(`Error importing article ${articleData.url}:`, error)
        errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed successfully`,
      stats: {
        totalInFile: importData.totalArticles,
        imported,
        skipped,
        errors
      }
    })
    
  } catch (error) {
    console.error('Import error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid import data format',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to import articles' },
      { status: 500 }
    )
  }
}

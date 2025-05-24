import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all articles from the database
    const articles = await prisma.article.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create export data structure
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalArticles: articles.length,
      articles: articles,
      metadata: {
        appName: 'Cocoa Reader',
        appVersion: '0.1.0'
      }
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="cocoa-reader-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export articles' },
      { status: 500 }
    )
  }
}

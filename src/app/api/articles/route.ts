import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ArticleListItem = {
  id: string
  url: string
  title: string
  domain: string
  excerpt: string | null
  createdAt: Date
  read: boolean
  scroll: number
}

/**
 * GET /api/articles - Get paginated list of articles with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const read = searchParams.get('read')
    const search = searchParams.get('search')?.trim()

    console.log('API /articles called with:', { page, limit, read, search })

    // Build where clause for read status
    const where: any = {}
    
    if (read === 'true') {
      where.read = true
    } else if (read === 'false') {
      where.read = false
    }

    // For search, we'll get all articles first and then filter in memory
    // This ensures case-insensitive search works properly with SQLite
    let articles
    let total

    if (search && search.length > 0) {
      // Get all articles that match the read filter
      const allArticles = await prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          title: true,
          domain: true,
          excerpt: true,
          createdAt: true,
          read: true,
          scroll: true,
        },
      })

      console.log(`Found ${allArticles.length} total articles before search filter`)

      // Filter by search term (case-insensitive, searches title, url, domain, excerpt)
      const searchLower = search.toLowerCase()
      const filteredArticles = allArticles.filter((article: ArticleListItem) => 
        article.title.toLowerCase().includes(searchLower) ||
        article.url.toLowerCase().includes(searchLower) ||
        article.domain.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower))
      )

      console.log(`Filtered to ${filteredArticles.length} articles matching search: "${search}"`)

      total = filteredArticles.length
      
      // Apply pagination to filtered results
      const startIndex = (page - 1) * limit
      articles = filteredArticles.slice(startIndex, startIndex + limit)
    } else {
      // No search term - use regular pagination
      total = await prisma.article.count({ where })
      
      articles = await prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          url: true,
          title: true,
          domain: true,
          excerpt: true,
          createdAt: true,
          read: true,
          scroll: true,
        },
      })
    }

    return NextResponse.json({
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

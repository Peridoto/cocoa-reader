import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type ArticleListItem = {
  id: string
  url: string
  title: string
  domain: string
  excerpt: string | null
  cleanedHTML: string
  textContent: string
  createdAt: Date
  read: boolean
  scroll: number
  favorite: boolean
  // AI Processing fields
  summary?: string | null
  keyPoints?: string | null
  readingTime?: number | null
  sentiment?: string | null
  primaryCategory?: string | null
  categories?: string | null
  tags?: string | null
  aiProcessed?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', read, favorite, search } = req.query
      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)
      const searchTerm = (search as string)?.trim()

      console.log('API /articles called with:', { page: pageNum, limit: limitNum, read, favorite, search: searchTerm })

      // Build where clause for read status and favorites
      const where: any = {}
      
      if (read === 'true') {
        where.read = true
      } else if (read === 'false') {
        where.read = false
      }

      if (favorite === 'true') {
        where.favorite = true
      }

      // Add search filter
      if (searchTerm && searchTerm.length > 0) {
        where.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { domain: { contains: searchTerm, mode: 'insensitive' } },
          { textContent: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }

      const skip = (pageNum - 1) * limitNum

      const [articles, totalCount] = await Promise.all([
        prisma.article.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          select: {
            id: true,
            url: true,
            title: true,
            domain: true,
            excerpt: true,
            cleanedHTML: true,
            textContent: true,
            createdAt: true,
            read: true,
            scroll: true,
            favorite: true,
            summary: true,
            keyPoints: true,
            readingTime: true,
            sentiment: true,
            primaryCategory: true,
            categories: true,
            tags: true,
            aiProcessed: true
          }
        }),
        prisma.article.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / limitNum)
      const hasNextPage = pageNum < totalPages
      const hasPreviousPage = pageNum > 1

      return res.status(200).json({
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      })

    } catch (error) {
      console.error('Error fetching articles:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

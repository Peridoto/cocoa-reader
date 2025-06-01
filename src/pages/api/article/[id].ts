import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateArticleSchema = z.object({
  read: z.boolean().optional(),
  scroll: z.number().min(0).max(100).optional(),
  favorite: z.boolean().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid article ID' })
  }

  switch (req.method) {
    case 'GET':
      try {
        const article = await prisma.article.findUnique({
          where: { id },
        })

        if (!article) {
          return res.status(404).json({ error: 'Article not found' })
        }

        return res.status(200).json(article)
      } catch (error) {
        console.error('Error fetching article:', error)
        return res.status(500).json({ error: 'Failed to fetch article' })
      }

    case 'PATCH':
      try {
        const updateData = updateArticleSchema.parse(req.body)

        const article = await prisma.article.update({
          where: { id },
          data: updateData,
        })

        return res.status(200).json(article)
      } catch (error) {
        console.error('Error updating article:', error)
        
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Validation error',
            details: error.errors
          })
        }

        return res.status(500).json({ error: 'Failed to update article' })
      }

    case 'DELETE':
      try {
        await prisma.article.delete({
          where: { id },
        })

        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting article:', error)
        return res.status(500).json({ error: 'Failed to delete article' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

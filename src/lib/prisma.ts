import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is properly configured
const databaseUrl = process.env.DATABASE_URL || 'file:./data/readlater.db'

// Validate DATABASE_URL format (support both SQLite and PostgreSQL)
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set')
} else if (!databaseUrl.startsWith('file:') && !databaseUrl.startsWith('postgres') && !databaseUrl.startsWith('prisma+postgres')) {
  console.warn('DATABASE_URL should start with "file:", "postgres://", "postgresql://", or "prisma+postgres://"')
  console.warn('Current DATABASE_URL:', databaseUrl.substring(0, 50) + '...')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

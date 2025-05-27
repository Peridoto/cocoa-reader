import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is properly configured
const databaseUrl = process.env.DATABASE_URL || 'file:./data/readlater.db'

if (!databaseUrl || !databaseUrl.startsWith('file:')) {
  console.error('DATABASE_URL must be set and start with "file:" protocol')
  console.error('Current DATABASE_URL:', databaseUrl)
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

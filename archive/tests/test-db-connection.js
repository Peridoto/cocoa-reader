const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKVzNTMzlXNzdEWkVSUlRWR1Y2SjJWQ0YiLCJ0ZW5hbnRfaWQiOiJhMzNmMmMwYjE4ZWY0MDhjOTE0MjliYmM3MWMxMDZhMzk0MDA4YjIxMDg5ZmY1MDhkOTE0OTNkN2QyMTFjNGQwIiwiaW50ZXJuYWxfc2VjcmV0IjoiYWRmYjcxZDYtMzQ2Yy00ZWEzLWE2ZjEtYmMxMDc4YTQwZDciIn0.76vk04jSzh3mZLrMKL3tm78w7TVK3TdE3laBcggwABo"

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  })

  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Try to query articles (this will fail if table doesn't exist, which is fine)
    try {
      const count = await prisma.article.count()
      console.log(`📊 Found ${count} articles in database`)
    } catch (e) {
      console.log('ℹ️  Articles table not yet created (this is normal)')
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

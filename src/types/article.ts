export interface Article {
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
  // AI Processing fields
  summary?: string | null
  keyPoints?: string | null
  readingTime?: number | null
  sentiment?: string | null
  primaryCategory?: string | null
  categories?: string | null
  tags?: string | null
  aiProcessed?: boolean
  processedAt?: Date | null
}

export interface CreateArticleRequest {
  url: string
}

export interface UpdateArticleRequest {
  read?: boolean
  scroll?: number
}

export interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
}

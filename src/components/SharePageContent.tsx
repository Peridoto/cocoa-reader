'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ClientScraper } from '@/lib/client-scraper'
import { localDB } from '@/lib/local-database'
import type { Article } from '@/types/article'

export default function SharePageContent() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const { url, title, text } = router.query
    
    if (url && typeof url === 'string') {
      console.log('SharePageContent processing URL:', url)
      handleSharedUrl(url, typeof title === 'string' ? title : null, typeof text === 'string' ? text : null)
    }
  }, [router.query])

  const handleSharedUrl = async (url: string, title?: string | null, text?: string | null) => {
    console.log('handleSharedUrl called with:', { url, title, text })
    try {
      setProcessing(true)
      setError('')

      // Initialize database
      await localDB.init()

      // Check if article already exists
      const existingArticles = await localDB.getAllArticles()
      const existingArticle = existingArticles.find(article => article.url === url)

      if (existingArticle) {
        console.log('Article already exists:', existingArticle.id)
        setArticle(existingArticle)
        setError('This article is already saved in your library.')
        return
      }

      // Create scraper instance
      const scraper = new ClientScraper()

      // Scrape the article
      const scrapedData = await scraper.scrapeArticle(url)

      // Create article object
      const newArticle: Omit<Article, 'id'> = {
        url: scrapedData.url || url,
        title: scrapedData.title || title || 'Shared Article',
        domain: scrapedData.domain || new URL(url).hostname,
        excerpt: scrapedData.excerpt || text || '',
        cleanedHTML: scrapedData.cleanedHTML || '',
        textContent: scrapedData.textContent || text || '',
        createdAt: new Date(),
        read: false,
        favorite: false,
        scroll: 0,
        readingTime: scrapedData.readingTime || null,
        aiProcessed: false
      }

      // Save to database
      const savedArticle = await localDB.saveArticle({
        ...newArticle,
        id: crypto.randomUUID()
      })
      console.log('Article saved:', savedArticle.id)
      setArticle(savedArticle)

    } catch (error) {
      console.error('Error processing shared URL:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleReadArticle = () => {
    if (article) {
      router.push(`/read-article?id=${article.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🍫</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cocoa Reader
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Processing shared article...
            </p>
          </div>

          {processing && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing article...
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {article && (
            <div className="mb-8">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {article.domain}
                </p>
                {article.excerpt && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex space-x-4">
                  <button
                    onClick={handleReadArticle}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Read Now
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Library
                  </button>
                </div>
              </div>
            </div>
          )}

          {!processing && !article && !error && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No article to process.
              </p>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClientScraper } from '@/lib/client-scraper'
import { localDB } from '@/lib/local-database'
import type { Article } from '@/types/article'

export default function SharePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')
  const [urlParam, setUrlParam] = useState<string | null>(null)

  console.log('SharePageContent render - states:', { processing, article: !!article, error, urlParam })

  useEffect(() => {
    console.log('=== SharePageContent useEffect START ===')
    
    const url = searchParams.get('url')
    const title = searchParams.get('title')
    const text = searchParams.get('text')

    console.log('SharePageContent useEffect triggered:', { url, title, text })
    console.log('All search params:', Object.fromEntries(searchParams.entries()))
    console.log('Search params keys:', Array.from(searchParams.keys()))
    console.log('Search params values:', Array.from(searchParams.values()))
    console.log('Window location search:', typeof window !== 'undefined' ? window.location.search : 'server-side')
    
    setUrlParam(url) // Store URL param for debugging

    if (url && url.trim()) {
      console.log('✅ URL found, calling handleSharedUrl:', url)
      setProcessing(true) // Ensure processing state is set
      handleSharedUrl(url, title, text).catch(err => {
        console.error('❌ handleSharedUrl failed:', err)
        setError(`Failed to process URL: ${err.message}`)
        setProcessing(false)
      })
    } else {
      console.log('❌ No valid URL found in search params')
      console.log('Available search params keys:', Array.from(searchParams.keys()))
      console.log('URL value type:', typeof url, 'URL value:', JSON.stringify(url))
      setProcessing(false)
    }
    
    console.log('=== SharePageContent useEffect END ===')
    // If no URL, just show the "No Article to Process" state
  }, [searchParams])

  const handleSharedUrl = async (url: string, title?: string | null, text?: string | null) => {
    console.log('handleSharedUrl called with:', { url, title, text })
    try {
      setProcessing(true)
      setError('')

      // Initialize database with timeout
      console.log('Initializing local database...')
      const initTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), 10000)
      )
      
      await Promise.race([localDB.init(), initTimeout])
      console.log('Database initialized successfully')

      // Check if article already exists
      console.log('Checking for existing articles...')
      const existingArticles = await localDB.getAllArticles()
      const existingArticle = existingArticles.find(article => article.url === url)

      if (existingArticle) {
        console.log('Article already exists:', existingArticle.id)
        setArticle(existingArticle)
        setError('This article is already saved in your library.')
        return
      }

      console.log('Creating scraper instance...')
      // Create scraper instance
      const scraper = new ClientScraper()

      console.log('Starting to scrape article:', url)
      // Scrape the article with timeout
      const scrapeTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Scraping timeout after 30 seconds')), 30000)
      )
      
      const scrapedData = await Promise.race([
        scraper.scrapeArticle(url),
        scrapeTimeout
      ]) as Partial<Article>
      console.log('Scraping completed, result:', scrapedData)

      // Create article object
      const newArticle: Omit<Article, 'id'> = {
        url: scrapedData.url || url,
        title: scrapedData.title || title || 'Shared Article',
        domain: scrapedData.domain || new URL(url).hostname,
        excerpt: scrapedData.excerpt || text || '',
        cleanedHTML: scrapedData.cleanedHTML || '',
        textContent: scrapedData.textContent || text || '',
        read: false,
        createdAt: new Date(),
        scroll: 0,
        readingTime: scrapedData.readingTime || 0,
        summary: null,
        keyPoints: null,
        categories: null,
        tags: null,
        sentiment: null
      }

      // Save to local database
      console.log('Saving article to local database...')
      const savedArticle = await localDB.saveArticle({
        ...newArticle,
        id: crypto.randomUUID()
      })
      console.log('Article saved successfully:', savedArticle.id)
      setArticle(savedArticle)

    } catch (error) {
      console.error('Error processing shared URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to save shared article')
    } finally {
      setProcessing(false)
    }
  }

  const handleContinueReading = () => {
    if (article) {
      router.push(`/read/${article.id}`)
    }
  }

  const handleViewLibrary = () => {
    router.push('/')
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Shared Article
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Extracting content and saving to your library...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📄 Shared Article
          </h1>

          {error && !article && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error Processing Article
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {article && (
            <>
              {error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="text-yellow-400 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {article.domain} • {article.readingTime} min read
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleContinueReading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Read Article
                </button>
                
                <button
                  onClick={handleViewLibrary}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  View Library
                </button>
              </div>
            </>
          )}

          {!article && !processing && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Article to Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {urlParam ? `Error processing URL: ${urlParam}` : 'No URL was shared to process.'}
              </p>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Debug info: {error}
                  </p>
                </div>
              )}
              <button
                onClick={handleViewLibrary}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Library
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

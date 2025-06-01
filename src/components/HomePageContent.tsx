'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Article } from '@/types/article'
import { debounce, normalizeUrl } from '@/lib/utils'
import { localDB } from '@/lib/local-database'
import { clientScraper } from '@/lib/client-scraper'
import { AddArticleForm } from '@/components/AddArticleForm'
import { ArticleList } from '@/components/ArticleList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ExportImport } from '@/components/ExportImport'
import { BatchProcessing } from '@/components/BatchProcessing'
import { Statistics } from '@/components/Statistics'
import { WelcomeSettings } from '@/components/WelcomeSettings'
import { CoffeeDonationButton } from '@/components/CoffeeDonationButton'

export default function HomePageContent() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread' | 'favorites'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [newArticleUrl, setNewArticleUrl] = useState('')
  const [addingArticle, setAddingArticle] = useState(false)
  const [addArticleError, setAddArticleError] = useState('')

  // Handle shared URLs
  useEffect(() => {
    const { url: sharedUrl, shared } = router.query
    const isSharedOffline = shared === 'offline'
    
    if (sharedUrl && typeof sharedUrl === 'string') {
      setNewArticleUrl(sharedUrl)
      console.log('Shared URL received:', sharedUrl)
    }
  }, [router.query])

  // Debounce search term to avoid excessive API calls
  const debouncedSetSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term)
    }, 300),
    []
  )

  // Update debounced search term when searchTerm changes
  useEffect(() => {
    debouncedSetSearch(searchTerm)
  }, [searchTerm, debouncedSetSearch])

  // Load articles from database
  const loadArticles = useCallback(async () => {
    try {
      setLoading(true)
      
      let loadedArticles: Article[] = []
      
      // Apply filter first
      if (filter === 'all') {
        loadedArticles = await localDB.getAllArticles()
      } else if (filter === 'unread') {
        loadedArticles = await localDB.filterArticles(false)
      } else if (filter === 'read') {
        loadedArticles = await localDB.filterArticles(true)
      } else if (filter === 'favorites') {
        loadedArticles = await localDB.filterFavoriteArticles()
      }
      
      // Apply search filter if needed
      if (debouncedSearchTerm.trim()) {
        loadedArticles = await localDB.searchArticles(debouncedSearchTerm)
        
        // If we have a specific filter and search, apply both
        if (filter !== 'all') {
          if (filter === 'unread') {
            loadedArticles = loadedArticles.filter(article => !article.read)
          } else if (filter === 'read') {
            loadedArticles = loadedArticles.filter(article => article.read)
          } else if (filter === 'favorites') {
            loadedArticles = loadedArticles.filter(article => article.favorite)
          }
        }
      }
      
      setArticles(loadedArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, debouncedSearchTerm])

  // Initial load and when filter/search changes
  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const handleArticleAdded = useCallback((newArticle: Article) => {
    console.log('Article added:', newArticle)
    setArticles(prev => [newArticle, ...prev])
    setNewArticleUrl('')
    setAddingArticle(false)
    setAddArticleError('')
  }, [])

  const handleArticleUpdated = useCallback((updatedArticle: Article) => {
    setArticles(prev => prev.map(article => 
      article.id === updatedArticle.id ? updatedArticle : article
    ))
  }, [])

  const handleArticleDeleted = useCallback((deletedId: string) => {
    setArticles(prev => prev.filter(article => article.id !== deletedId))
  }, [])

  const handleToggleFavorite = useCallback(async (article: Article) => {
    try {
      const updatedArticle = { ...article, favorite: !article.favorite }
      await localDB.updateArticle(article.id, { favorite: !article.favorite })
      setArticles(prev => prev.map(a => 
        a.id === article.id ? updatedArticle : a
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }, [])

  const handleAddUrlClick = useCallback(async () => {
    if (!newArticleUrl.trim()) return
    
    setAddingArticle(true)
    setAddArticleError('')

    try {
      // Auto-complete URL with https:// if needed before processing
      let urlToProcess = newArticleUrl.trim()
      if (!urlToProcess.includes('://') && !urlToProcess.startsWith('//')) {
        if (urlToProcess.includes('.') && !urlToProcess.includes(' ')) {
          urlToProcess = `https://${urlToProcess}`
        }
      }

      console.log('🔄 Scraping article from URL:', urlToProcess)
      
      // Use client-side scraper to extract article content
      const scrapedArticle = await clientScraper.scrapeArticle(normalizeUrl(urlToProcess))
      
      console.log('📄 Article scraped successfully:', scrapedArticle.title)
      
      // Create complete article object
      const article: Article = {
        id: crypto.randomUUID(),
        title: scrapedArticle.title || 'Untitled Article',
        url: scrapedArticle.url || normalizeUrl(urlToProcess),
        domain: scrapedArticle.domain || new URL(normalizeUrl(urlToProcess)).hostname,
        excerpt: scrapedArticle.excerpt || '',
        cleanedHTML: scrapedArticle.cleanedHTML || '',
        textContent: scrapedArticle.textContent || '',
        read: false,
        favorite: false,
        createdAt: new Date(),
        scroll: 0,
        readingTime: scrapedArticle.readingTime || 1,
        summary: '',
        keyPoints: '',
        sentiment: 'neutral'
      }

      console.log('💾 Saving article to database:', article.title)
      
      // Save to local database
      await localDB.saveArticle(article)
      
      console.log('✅ Article saved successfully, updating UI')
      
      // Update UI state - add new article to the top of the list
      setArticles(prev => [article, ...prev])
      
      // Clear the input
      setNewArticleUrl('')
      setAddingArticle(false)
      setAddArticleError('')
      
      console.log('🎉 Article successfully added to the list!')
      
    } catch (error) {
      console.error('❌ Failed to add article:', error)
      setAddArticleError(error instanceof Error ? error.message : 'Failed to add article. Please check the URL and try again.')
      setAddingArticle(false)
    }
  }, [newArticleUrl])

  const handleAddArticleError = useCallback((error: string) => {
    setAddArticleError(error)
    setAddingArticle(false)
  }, [])

  const filteredArticlesCount = articles.length
  const totalArticlesCount = articles.length

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🍫</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Cocoa Reader
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Your personal read later app
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CoffeeDonationButton articlesCount={articles.length} />
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow text-gray-600 dark:text-gray-300"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Add Article Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Article
            </h2>
            <div className="flex space-x-4">
              <input
                type="url"
                value={newArticleUrl}
                onChange={(e) => setNewArticleUrl(e.target.value)}
                placeholder="Paste article URL here..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={addingArticle}
              />
              <button
                onClick={handleAddUrlClick}
                disabled={!newArticleUrl.trim() || addingArticle}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {addingArticle ? 'Adding...' : 'Add Article'}
              </button>
            </div>
            {addArticleError && (
              <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{addArticleError}</p>
            )}
          </div>

          {/* Add Article Form - shows when adding */}
          {addingArticle && (
            <div className="mb-8">
              <AddArticleForm
                prefilledUrl={newArticleUrl}
                onArticleAdded={handleArticleAdded}
                onSuccess={() => {
                  setAddingArticle(false)
                  setNewArticleUrl('')
                }}
                onCancel={() => {
                  setAddingArticle(false)
                  setAddArticleError('')
                }}
              />
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'unread', 'read', 'favorites'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8">
            <Statistics articles={articles} />
          </div>

          {/* Articles List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Articles
                {filteredArticlesCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({filteredArticlesCount} {filter !== 'all' ? `${filter} ` : ''}article{filteredArticlesCount !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>
            <ArticleList
              articles={articles}
              loading={loading}
              onArticleUpdated={handleArticleUpdated}
              onArticleDeleted={handleArticleDeleted}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                title="Close Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <WelcomeSettings onWelcomeReset={() => setShowSettings(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

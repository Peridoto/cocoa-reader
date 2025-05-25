'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Article } from '@/types/article'
import { debounce } from '@/lib/utils'
import { localDB } from '@/lib/local-database'
import { AddArticleForm } from '@/components/AddArticleForm'
import { ArticleList } from '@/components/ArticleList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ExportImport } from '@/components/ExportImport'
import { BatchProcessing } from '@/components/BatchProcessing'

export default function HomePageContent() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Handle shared URLs
  useEffect(() => {
    const sharedUrl = searchParams.get('url')
    const isSharedOffline = searchParams.get('shared') === 'offline'
    
    if (sharedUrl || isSharedOffline) {
      setShowAddForm(true)
      // If there's a shared URL, pre-fill the form
      if (sharedUrl) {
        console.log('Shared URL received:', sharedUrl)
      }
    }
  }, [searchParams])

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

  const fetchArticles = async () => {
    try {
      setLoading(true)
      
      // Initialize database if needed
      await localDB.init()

      let articles: Article[] = []

      // Get articles from local database
      if (filter === 'all') {
        if (debouncedSearchTerm.trim()) {
          articles = await localDB.searchArticles(debouncedSearchTerm)
        } else {
          articles = await localDB.getAllArticles()
        }
      } else {
        const readStatus = filter === 'read'
        articles = await localDB.filterArticles(readStatus)
        
        // Apply search filter if needed
        if (debouncedSearchTerm.trim()) {
          articles = articles.filter(article => 
            article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            article.textContent.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            article.domain.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            (article.summary && article.summary.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
          )
        }
      }

      // If no articles in database, add demo articles for first-time users
      if (articles.length === 0 && filter === 'all' && !debouncedSearchTerm.trim()) {
        const demoArticles: Article[] = [
          {
            id: 'demo-1',
            title: 'Welcome to Cocoa Reader PWA',
            url: 'https://example.com/welcome',
            domain: 'example.com',
            excerpt: 'Welcome to the full-featured Cocoa Reader PWA! This version has complete offline functionality including article saving, AI processing, and local storage.',
            cleanedHTML: '<h1>Welcome to Cocoa Reader PWA</h1><p>This is the complete Progressive Web App version of Cocoa Reader. You can now:</p><ul><li>Save articles from any URL</li><li>Process articles with AI offline</li><li>Export and import your data</li><li>Work completely offline</li></ul>',
            textContent: 'Welcome to Cocoa Reader PWA. This is the complete Progressive Web App version with full offline functionality.',
            read: false,
            createdAt: new Date(),
            scroll: 0,
            readingTime: 2,
            summary: 'Introduction to Cocoa Reader PWA with full offline capabilities',
            keyPoints: 'Offline functionality, Article saving, AI processing, Data export/import',
            sentiment: 'positive'
          },
          {
            id: 'demo-2',
            title: 'Web Share Target Feature',
            url: 'https://example.com/web-share',
            domain: 'example.com',
            excerpt: 'The Web Share Target API allows web applications to receive shared content from other apps and websites. This PWA supports sharing URLs directly from your browser or other apps.',
            cleanedHTML: '<h1>Web Share Target Feature</h1><p>With the Web Share Target API, you can:</p><ul><li>Share articles from any website directly to Cocoa Reader</li><li>Use the system share menu on mobile devices</li><li>Process shared content offline</li><li>Save shared articles to your local library</li></ul>',
            textContent: 'Web Share Target allows sharing content directly to the PWA from other apps and websites.',
            read: false,
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            scroll: 0,
            readingTime: 3,
            summary: 'Overview of Web Share Target API functionality in PWAs',
            keyPoints: 'Share content, Mobile sharing, Offline processing, Local storage',
            sentiment: 'positive'
          }
        ]
        
        // Save demo articles to database
        for (const article of demoArticles) {
          await localDB.saveArticle(article)
        }
        
        articles = demoArticles
      }

      setArticles(articles)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [filter, debouncedSearchTerm])

  const handleArticleAdded = async (newArticle: Article) => {
    try {
      // Save to local database
      await localDB.saveArticle(newArticle)
      setArticles(prev => [newArticle, ...prev])
    } catch (error) {
      console.error('Failed to save article:', error)
    }
  }

  const handleArticleUpdated = async (updatedArticle: Article) => {
    try {
      // Update in local database
      await localDB.updateArticle(updatedArticle.id, updatedArticle)
      setArticles(prev => 
        prev.map(article => 
          article.id === updatedArticle.id ? updatedArticle : article
        )
      )
    } catch (error) {
      console.error('Failed to update article:', error)
    }
  }

  const handleArticleDeleted = async (articleId: string) => {
    try {
      // Delete from local database
      await localDB.deleteArticle(articleId)
      setArticles(prev => prev.filter(article => article.id !== articleId))
    } catch (error) {
      console.error('Failed to delete article:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🥥 Cocoa Reader
            </h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                title="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your personal read-later app with AI-powered insights
          </p>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
              
              <div className="space-y-6">
                <ExportImport />
                <BatchProcessing articles={articles} onArticlesUpdated={setArticles} />
              </div>
            </div>
          )}

          {/* Add Article Form */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Article
            </button>
          </div>

          {/* Add Article Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Article
                </h2>
                <AddArticleForm
                  onArticleAdded={handleArticleAdded}
                  onSuccess={() => setShowAddForm(false)}
                  onCancel={() => setShowAddForm(false)}
                  prefilledUrl={searchParams.get('url') || undefined}
                />
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              {(['all', 'unread', 'read'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    filter === filterOption
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Articles List */}
        <ArticleList
          articles={articles}
          loading={loading}
          onArticleUpdated={handleArticleUpdated}
          onArticleDeleted={handleArticleDeleted}
        />
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Article } from '@/types/article'
import { debounce } from '@/lib/utils'
import { AddArticleForm } from '@/components/AddArticleForm'
import { ArticleList } from '@/components/ArticleList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ExportImport } from '@/components/ExportImport'
import { BatchProcessing } from '@/components/BatchProcessing'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)

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
      const params = new URLSearchParams()
      if (filter === 'read') params.set('read', 'true')
      if (filter === 'unread') params.set('read', 'false')
      if (debouncedSearchTerm.trim()) params.set('search', debouncedSearchTerm.trim())

      const response = await fetch(`/api/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        console.error('Failed to fetch articles:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [filter, debouncedSearchTerm])

  const handleArticleAdded = (newArticle: Article) => {
    setArticles(prev => [newArticle, ...prev])
  }

  const handleArticleUpdated = (updatedArticle: Article) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === updatedArticle.id ? updatedArticle : article
      )
    )
  }

  const handleArticleDeleted = (articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🥥 Cocoa Reader
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
          <p className="text-gray-600 dark:text-gray-400">
            Save articles to read later in a clean, distraction-free environment
          </p>
        </header>

        <div className="mb-8">
          <AddArticleForm onArticleAdded={handleArticleAdded} />
        </div>

        {showSettings && (
          <div className="mb-8 space-y-6">
            <ExportImport onImportComplete={fetchArticles} />
            <BatchProcessing onComplete={fetchArticles} />
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ArticleList
          articles={articles}
          loading={loading}
          onArticleUpdated={handleArticleUpdated}
          onArticleDeleted={handleArticleDeleted}
        />

        {/* Batch processing component */}
        <div className="mt-8">
          <BatchProcessing />
        </div>
      </div>
    </div>
  )
}

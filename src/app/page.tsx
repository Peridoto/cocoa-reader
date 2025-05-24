'use client'

import { useState, useEffect, useCallback } from 'react'
import { Article } from '@/types/article'
import { AddArticleForm } from '@/components/AddArticleForm'
import { ArticleList } from '@/components/ArticleList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { debounce } from '@/lib/utils'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

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
              Cocoa Reader
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Save articles to read later in a clean, distraction-free environment
          </p>
        </header>

        <div className="mb-8">
          <AddArticleForm onArticleAdded={handleArticleAdded} />
        </div>

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
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Article } from '@/types/article'
import { normalizeUrl } from '@/lib/utils'
import { clientScraper } from '@/lib/client-scraper'
import { clientAI } from '@/lib/client-ai'

interface AddArticleFormProps {
  onArticleAdded: (article: Article) => void
}

export function AddArticleForm({ onArticleAdded }: AddArticleFormProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Show preview of normalized URL if it would be different
  const normalizedUrl = normalizeUrl(url)
  const showPreview = url.trim() && normalizedUrl !== url.trim() && normalizedUrl.startsWith('https://')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')

    try {
      // Use client-side scraper to extract article content
      const scrapedArticle = await clientScraper.scrapeArticle(normalizeUrl(url))
      
      // Create complete article object
      const article: Article = {
        id: crypto.randomUUID(),
        title: scrapedArticle.title || 'Untitled Article',
        url: scrapedArticle.url || normalizeUrl(url),
        domain: scrapedArticle.domain || new URL(normalizeUrl(url)).hostname,
        excerpt: scrapedArticle.excerpt || '',
        cleanedHTML: scrapedArticle.cleanedHTML || '',
        textContent: scrapedArticle.textContent || '',
        read: false,
        createdAt: new Date(),
        scroll: 0,
        readingTime: scrapedArticle.readingTime || 1,
        summary: '',
        keyPoints: '',
        sentiment: 'neutral'
      }

      // Process with AI in the background
      try {
        const aiProcessed = await clientAI.processArticle(article)
        Object.assign(article, aiProcessed)
      } catch (aiError) {
        console.warn('AI processing failed, article saved without AI data:', aiError)
      }

      onArticleAdded(article)
      setUrl('')
    } catch (error) {
      console.error('Error adding article:', error)
      setError(error instanceof Error ? error.message : 'Failed to add article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com/article or https://example.com/article"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Save Article'}
        </button>
      </div>
      
      {showPreview && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            Will save as: <span className="font-mono">{normalizedUrl}</span>
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </form>
  )
}

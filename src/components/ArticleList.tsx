'use client'

import Link from 'next/link'
import { Article } from '@/types/article'
import { formatDistanceToNow } from '@/lib/utils'
import { ArticleAISummary } from './ArticleAISummary'
import { AIProcessButton } from './AIProcessButton'

interface ArticleListProps {
  articles: Article[]
  loading: boolean
  onArticleUpdated: (article: Article) => void
  onArticleDeleted: (articleId: string) => void
}

export function ArticleList({ 
  articles, 
  loading, 
  onArticleUpdated, 
  onArticleDeleted 
}: ArticleListProps) {
  const toggleReadStatus = async (article: Article) => {
    try {
      const response = await fetch(`/api/article/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !article.read }),
      })

      if (response.ok) {
        const updatedArticle = await response.json()
        onArticleUpdated(updatedArticle)
      }
    } catch (error) {
      console.error('Error updating article:', error)
    }
  }

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/article/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onArticleDeleted(articleId)
      }
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const handleAIProcessComplete = (articleId: string) => {
    // Refresh the specific article to show updated AI data
    const refreshArticle = async () => {
      try {
        const response = await fetch(`/api/article/${articleId}`)
        if (response.ok) {
          const updatedArticle = await response.json()
          onArticleUpdated(updatedArticle)
        }
      } catch (error) {
        console.error('Error refreshing article:', error)
      }
    }
    refreshArticle()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No articles found. Add your first article above!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <article
          key={article.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {article.title}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>{article.domain}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(article.createdAt))} ago</span>
                {article.read && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400">Read</span>
                  </>
                )}
                {article.scroll > 0 && (
                  <>
                    <span>•</span>
                    <span>{article.scroll}% progress</span>
                  </>
                )}
              </div>

              {article.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
              )}

              {/* AI Summary Component */}
              <ArticleAISummary article={article} />
            </div>

            <div className="flex flex-col gap-2 min-w-[120px]">
              <Link
                href={`/read/${article.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
              >
                Read
              </Link>
              
              <button
                onClick={() => toggleReadStatus(article)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  article.read
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                }`}
              >
                {article.read ? 'Mark Unread' : 'Mark Read'}
              </button>
              
              <button
                onClick={() => deleteArticle(article.id)}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-sm"
              >
                Delete
              </button>

              {/* AI Process Button */}
              <AIProcessButton 
                articleId={article.id} 
                isProcessed={article.aiProcessed || false}
                onProcessComplete={() => handleAIProcessComplete(article.id)} 
                size="sm"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

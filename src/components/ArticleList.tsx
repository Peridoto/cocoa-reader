'use client'

import Link from 'next/link'
import { Article } from '@/types/article'
import { formatDistanceToNow } from '@/lib/utils'
import { localDB } from '@/lib/local-database'
import { ArticleAISummary } from './ArticleAISummary'
import { AIProcessButton } from './AIProcessButton'

interface ArticleListProps {
  articles: Article[]
  loading: boolean
  onArticleUpdated: (article: Article) => void
  onArticleDeleted: (articleId: string) => void
  onToggleFavorite: (article: Article) => void
}

export function ArticleList({ 
  articles, 
  loading, 
  onArticleUpdated, 
  onArticleDeleted,
  onToggleFavorite
}: ArticleListProps) {
  const toggleReadStatus = async (article: Article) => {
    try {
      const updatedArticle = { ...article, read: !article.read }
      await localDB.updateArticle(article.id, { read: !article.read })
      onArticleUpdated(updatedArticle)
    } catch (error) {
      console.error('Error updating article:', error)
    }
  }

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      await localDB.deleteArticle(articleId)
      onArticleDeleted(articleId)
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const handleAIProcessComplete = (articleId: string) => {
    // Refresh the specific article from local database to show updated AI data
    const refreshArticle = async () => {
      try {
        const updatedArticle = await localDB.getArticle(articleId)
        if (updatedArticle) {
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
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                  title="Open original article"
                >
                  {article.domain}
                </a>
                <span>•</span>
                <span>
                  {(() => {
                    const timeText = formatDistanceToNow(new Date(article.createdAt))
                    return timeText === 'just now' ? timeText : `${timeText} ago`
                  })()}
                </span>
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
                onClick={() => onToggleFavorite(article)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1 ${
                  article.favorite
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/40'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={article.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-4 h-4" fill={article.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {article.favorite ? 'Favorited' : 'Favorite'}
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

              {/* Progress Information */}
              {article.scroll > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  {article.scroll}% progress
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

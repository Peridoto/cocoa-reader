import { Article } from '@/types/article'
import { ClockIcon, TagIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'

interface ArticleAISummaryProps {
  article: Article
  showFullSummary?: boolean
}

export function ArticleAISummary({ article, showFullSummary = false }: ArticleAISummaryProps) {
  // Parse JSON fields safely
  const keyPoints = article.keyPoints ? JSON.parse(article.keyPoints) : []
  const categories = article.categories ? JSON.parse(article.categories) : []
  const tags = article.tags ? JSON.parse(article.tags) : []

  // Don't render if article hasn't been processed
  if (!article.aiProcessed || !article.summary) {
    return null
  }

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSentimentEmoji = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😞'
      default:
        return '😐'
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
      {/* AI Summary */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
          AI Summary
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {showFullSummary ? article.summary : `${article.summary.slice(0, 200)}${article.summary.length > 200 ? '...' : ''}`}
        </p>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && showFullSummary && (
        <div>
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Key Points
          </h4>
          <ul className="space-y-1">
            {keyPoints.map((point: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {/* Reading Time */}
        {article.readingTime && (
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>{article.readingTime} min read</span>
          </div>
        )}

        {/* Sentiment */}
        {article.sentiment && (
          <div className="flex items-center gap-1">
            <span>{getSentimentEmoji(article.sentiment)}</span>
            <span className={getSentimentColor(article.sentiment)}>
              {article.sentiment}
            </span>
          </div>
        )}

        {/* Primary Category */}
        {article.primaryCategory && (
          <div className="flex items-center gap-1">
            <TagIcon className="h-4 w-4" />
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
              {article.primaryCategory}
            </span>
          </div>
        )}
      </div>

      {/* Tags and Additional Categories */}
      {showFullSummary && (categories.length > 1 || tags.length > 0) && (
        <div className="space-y-2">
          {/* Additional Categories */}
          {categories.length > 1 && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Categories
              </h4>
              <div className="flex flex-wrap gap-1">
                {categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

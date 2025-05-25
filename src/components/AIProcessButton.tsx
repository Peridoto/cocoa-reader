import { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { localDB } from '@/lib/local-database'
import { clientAI } from '@/lib/client-ai'

interface AIProcessButtonProps {
  articleId: string
  isProcessed: boolean
  onProcessComplete?: () => void
  size?: 'sm' | 'md'
}

export function AIProcessButton({ 
  articleId, 
  isProcessed, 
  onProcessComplete,
  size = 'sm'
}: AIProcessButtonProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (processing || isProcessed) return

    setProcessing(true)
    setError(null)

    try {
      // Get the current article from local database
      const article = await localDB.getArticle(articleId)
      if (!article) {
        throw new Error('Article not found')
      }

      // Process with client-side AI
      const aiResults = await clientAI.processArticle(article)
      
      // Update article with AI results
      const updatedArticle = await localDB.updateArticle(articleId, {
        ...aiResults,
        aiProcessed: true
      })

      if (updatedArticle) {
        onProcessComplete?.()
      } else {
        throw new Error('Failed to update article with AI results')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error processing article:', err)
    } finally {
      setProcessing(false)
    }
  }

  if (isProcessed) {
    return (
      <span className={`inline-flex items-center gap-1 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } text-green-600 dark:text-green-400`}>
        <SparklesIcon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        AI Processed
      </span>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleProcess}
        disabled={processing}
        data-testid="ai-process-button"
        data-article-id={articleId}
        className={`inline-flex items-center gap-1 transition-colors ${
          size === 'sm' 
            ? 'text-xs px-2 py-1' 
            : 'text-sm px-3 py-2'
        } ${
          processing
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
        } border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20`}
      >
        <SparklesIcon className={`${
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
        } ${processing ? 'animate-spin' : ''}`} />
        {processing ? 'Processing...' : 'Generate AI Summary'}
      </button>
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

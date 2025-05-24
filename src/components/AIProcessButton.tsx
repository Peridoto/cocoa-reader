import { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

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
      const response = await fetch('/api/articles/process-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process article')
      }

      const result = await response.json()
      
      if (result.success) {
        onProcessComplete?.()
      } else {
        throw new Error(result.error || 'Processing failed')
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

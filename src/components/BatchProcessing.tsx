import { useState } from 'react'
import { SparklesIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { localDB } from '@/lib/local-database'
import { clientAI } from '@/lib/client-ai'
import { Article } from '@/types/article'

interface BatchProcessingProps {
  articles: Article[]
  onArticlesUpdated: (articles: Article[]) => void
  onComplete?: () => void
}

export function BatchProcessing({ articles, onArticlesUpdated, onComplete }: BatchProcessingProps) {
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{
    processed: number
    failed: number
    total: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBatchProcess = async () => {
    if (processing) return

    setProcessing(true)
    setError(null)
    setResults(null)

    try {
      // Filter articles that need processing (no summary or key points)
      const unprocessedArticles = articles.filter(article => 
        !article.summary || !article.keyPoints || article.summary === '' || article.keyPoints === ''
      )

      if (unprocessedArticles.length === 0) {
        setResults({ processed: 0, failed: 0, total: 0 })
        return
      }

      // Process articles with client-side AI
      const processedArticles = await clientAI.batchProcess(unprocessedArticles)
      
      let processedCount = 0
      let failedCount = 0
      const updatedArticles = [...articles]

      // Save processed articles back to database and update local state
      for (const article of processedArticles) {
        try {
          await localDB.saveArticle(article)
          
          // Update the article in the local articles array
          const index = updatedArticles.findIndex(a => a.id === article.id)
          if (index !== -1) {
            updatedArticles[index] = article
          }
          
          processedCount++
        } catch (error) {
          console.error('Failed to save processed article:', error)
          failedCount++
        }
      }

      setResults({
        processed: processedCount,
        failed: failedCount,
        total: unprocessedArticles.length
      })

      if (processedCount > 0) {
        // Update the parent component's articles state
        onArticlesUpdated(updatedArticles)
        onComplete?.()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error in batch processing:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CpuChipIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Batch Processing
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Process multiple articles at once to generate summaries, categories, and reading time estimates.
      </p>

      <div className="space-y-3">
        <button
          onClick={handleBatchProcess}
          disabled={processing}
          data-testid="batch-process-button"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            processing
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
          }`}
        >
          <SparklesIcon className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
          {processing ? 'Processing Articles...' : 'Process Unprocessed Articles'}
        </button>

        {/* Progress/Results */}
        {processing && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium">Processing articles...</span>
            </div>
          </div>
        )}

        {results && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
            <div className="text-sm text-green-800 dark:text-green-200">
              <div className="font-medium mb-1">Batch Processing Complete!</div>
              <div className="space-y-1">
                <div>✅ Successfully processed: {results.processed} articles</div>
                {results.failed > 0 && (
                  <div>❌ Failed to process: {results.failed} articles</div>
                )}
                {results.total === 0 && (
                  <div>ℹ️ No unprocessed articles found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
            <div className="text-sm text-red-800 dark:text-red-200">
              <div className="font-medium mb-1">Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          AI Processing Features
        </h4>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• Automatic summarization using extractive techniques</li>
          <li>• Content categorization (Technology, Science, Business, etc.)</li>
          <li>• Sentiment analysis (Positive, Negative, Neutral)</li>
          <li>• Reading time estimation</li>
          <li>• Key points extraction</li>
          <li>• Automatic tag generation</li>
        </ul>
      </div>
    </div>
  )
}

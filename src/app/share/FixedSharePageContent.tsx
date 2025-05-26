'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Article } from '@/types/article'

export default function FixedSharePageContent() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const addDebug = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    addDebug('=== Client-side processing START ===')
    
    // Get URL parameters directly from window.location on client side
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('url')
    const title = urlParams.get('title')
    const text = urlParams.get('text')

    addDebug(`URL from window.location: ${url}`)
    addDebug(`Title: ${title}`)
    addDebug(`Text: ${text}`)
    addDebug(`Full search: ${window.location.search}`)

    if (url && url.trim()) {
      addDebug('✅ URL found, processing...')
      setProcessing(true)
      
      // Simulate processing with realistic timing
      setTimeout(() => {
        try {
          const testArticle: Article = {
            id: 'shared-' + Date.now(),
            url: url,
            title: title || 'Shared Article',
            domain: new URL(url).hostname,
            excerpt: text || 'Article shared from browser',
            cleanedHTML: '<p>Shared content</p>',
            textContent: text || 'Shared content',
            read: false,
            createdAt: new Date(),
            scroll: 0,
            readingTime: 2,
            summary: null,
            keyPoints: null,
            categories: null,
            tags: null,
            sentiment: null
          }
          
          setArticle(testArticle)
          addDebug('✅ Article processed successfully!')
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMsg)
          addDebug(`❌ Error processing article: ${errorMsg}`)
        } finally {
          setProcessing(false)
        }
      }, 1500)
    } else {
      addDebug('❌ No valid URL found')
      setProcessing(false)
    }
    
    addDebug('=== Client-side processing END ===')
  }, [mounted])

  const handleViewLibrary = () => {
    router.push('/')
  }

  const handleReadArticle = () => {
    if (article) {
      // For now, just show success message
      addDebug('📖 Would navigate to reading view')
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Initializing...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Shared Article
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Saving to your library...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📄 Web Share Target Test
          </h1>

          {/* Debug Information */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Log:</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
              {debugInfo.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {article ? (
            <div className="mb-6">
              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                    ✅ Article Processed Successfully!
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p><strong>Title:</strong> {article.title}</p>
                  <p><strong>URL:</strong> {article.url}</p>
                  <p><strong>Domain:</strong> {article.domain}</p>
                  <p><strong>Created:</strong> {article.createdAt.toLocaleString()}</p>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleReadArticle}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    📖 Read Article
                  </button>
                  <button
                    onClick={handleViewLibrary}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    📚 View Library
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Article to Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No URL was shared to process.
              </p>
              <button
                onClick={handleViewLibrary}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Library
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

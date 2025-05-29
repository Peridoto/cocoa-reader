'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Article } from '@/types/article'

export default function SimpleSharePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebug = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Add a small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      addDebug('=== useEffect START ===')
      
      const url = searchParams.get('url')
      const title = searchParams.get('title')
      const text = searchParams.get('text')

      addDebug(`URL: ${url}`)
      addDebug(`Title: ${title}`)
      addDebug(`Text: ${text}`)
      addDebug(`All params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}`)
      addDebug(`Window location: ${typeof window !== 'undefined' ? window.location.search : 'server-side'}`)

      if (url && url.trim()) {
        addDebug('✅ URL found, processing...')
        setProcessing(true)
        
        // Simulate processing
        setTimeout(() => {
          try {
            const testArticle: Article = {
              id: 'test-' + Date.now(),
              url: url,
              title: title || 'Test Shared Article',
              domain: new URL(url).hostname,
              excerpt: text || 'This is a test article created from shared URL',
              cleanedHTML: '<p>Test content</p>',
              textContent: text || 'Test content',
              read: false,
              favorite: false,
              createdAt: new Date(),
              scroll: 0,
              readingTime: 1,
              summary: null,
              keyPoints: null,
              categories: null,
              tags: null,
              sentiment: null
            }
            
            setArticle(testArticle)
            addDebug('✅ Test article created successfully')
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMsg)
            addDebug(`❌ Error creating test article: ${errorMsg}`)
          } finally {
            setProcessing(false)
          }
        }, 1000)
      } else {
        addDebug('❌ No valid URL found')
        setProcessing(false)
      }
      
      addDebug('=== useEffect END ===')
    }, 100) // Small delay for hydration
    
    return () => clearTimeout(timer)
  }, [searchParams])

  const handleViewLibrary = () => {
    router.push('/')
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Test Article
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Creating test article from shared URL...
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
            🧪 Simple Share Test
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
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-1">
                  ✅ Test Article Created Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  <strong>Title:</strong> {article.title}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  <strong>URL:</strong> {article.url}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Domain:</strong> {article.domain}
                </p>
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
            </div>
          )}

          <button
            onClick={handleViewLibrary}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Article } from '@/types/article'
import { ThemeToggle } from '@/components/ThemeToggle'
import { calculateReadingProgress, debounce } from '@/lib/utils'
import { localDB } from '@/lib/local-database'
import { ArticleAISummary } from '@/components/ArticleAISummary'
import { AIProcessButton } from '@/components/AIProcessButton'

export default function ReadingPageClient() {
  const router = useRouter()
  const { id } = router.query
  const articleId = Array.isArray(id) ? id[0] : id
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [readingProgress, setReadingProgress] = useState(0)
  const [showAutoReadMessage, setShowAutoReadMessage] = useState(false)

  // Update CSS custom property for progress bar
  useEffect(() => {
    document.documentElement.style.setProperty('--progress-width', `${Math.min(100, Math.max(0, readingProgress))}%`)
  }, [readingProgress])

  // Debounced function to update scroll progress
  const updateScrollProgress = useCallback(
    debounce(async (progress: number) => {
      if (!article) return
      
      try {
        // Prepare update data
        const updateData: { scroll: number; read?: boolean } = { scroll: progress }
        
        // Auto-mark as read when reaching 100% progress (if not already read)
        if (progress >= 100 && !article.read) {
          updateData.read = true
        }
        
        // Update article in local database
        const updatedArticle = await localDB.updateArticle(article.id, updateData)
        
        // Update local state if the article was marked as read
        if (updateData.read && updatedArticle) {
          setArticle(updatedArticle)
          // Show auto-read message
          setShowAutoReadMessage(true)
          setTimeout(() => setShowAutoReadMessage(false), 3000)
        }
      } catch (error) {
        console.error('Error updating scroll progress:', error)
      }
    }, 1000),
    [article]
  )

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const progress = calculateReadingProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight
      )
      setReadingProgress(progress)
      updateScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateScrollProgress])

  // Fetch article
  useEffect(() => {
    const fetchArticle = async () => {
      console.log('ReadingPageClient: Starting fetchArticle with articleId:', articleId)
      
      if (!articleId) {
        console.error('ReadingPageClient: No article ID provided')
        setError('No article ID provided')
        setLoading(false)
        return
      }
      
      try {
        console.log('ReadingPageClient: Fetching article from localDB...')
        const articleData = await localDB.getArticle(articleId)
        console.log('ReadingPageClient: Article data received:', articleData ? 'Article found' : 'Article not found')
        
        if (!articleData) {
          throw new Error('Article not found')
        }
        
        console.log('ReadingPageClient: Article loaded successfully:', {
          id: articleData.id,
          title: articleData.title,
          domain: articleData.domain,
          hasContent: !!articleData.cleanedHTML,
          contentLength: articleData.cleanedHTML?.length || 0
        })
        
        setArticle(articleData)
        setReadingProgress(articleData.scroll)
      } catch (err) {
        console.error('ReadingPageClient: Error loading article:', err)
        setError(err instanceof Error ? err.message : 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [articleId])

  const toggleReadStatus = async () => {
    if (!article) return

    try {
      const updatedArticle = await localDB.updateArticle(article.id, { read: !article.read })
      if (updatedArticle) {
        setArticle(updatedArticle)
      }
    } catch (error) {
      console.error('Error updating article:', error)
    }
  }

  const handleAIProcessComplete = async () => {
    if (!articleId) return
    
    try {
      const updatedArticle = await localDB.getArticle(articleId)
      if (updatedArticle) {
        setArticle(updatedArticle)
      }
    } catch (error) {
      console.error('Error refreshing article:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading article...</div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center safe-area-insets">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Article not found'}</p>
          <button
            onClick={() => {
              console.log('Back button clicked from error page')
              
              // Check if we're in a Capacitor context
              if (typeof window !== 'undefined' && (window as any).Capacitor) {
                console.log('Running in Capacitor - using window.location')
                window.location.href = '/'
              } else {
                console.log('Running in browser - using router.push')
                router.push('/')
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 safe-area-insets">
      {/* Auto-read notification */}
      {showAutoReadMessage && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 ease-in-out transform safe-area-inset-top">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Article automatically marked as read!
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div className="h-full bg-blue-600 reading-progress-bar" />
      </div>

      {/* Header */}
      <header className="sticky top-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              console.log('Back button clicked')
              
              // Check if we're in a Capacitor context
              if (typeof window !== 'undefined' && (window as any).Capacitor) {
                console.log('Running in Capacitor - using window.location')
                window.location.href = '/'
              } else {
                console.log('Running in browser - using router.push')
                router.push('/')
              }
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Articles
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {readingProgress}% complete
            </div>
            
            <button
              onClick={toggleReadStatus}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                article.read
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {article.read ? 'Read' : 'Mark as Read'}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Article content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="reading-content">
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <span className="font-medium">{article.domain}</span>
              <span>•</span>
              <time dateTime={article.createdAt.toString()}>
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* AI Summary and Processing */}
            <div className="mt-6 space-y-4">
              <ArticleAISummary article={article} showFullSummary={true} />
              
              {!article.aiProcessed && (
                <div className="flex justify-start">
                  <AIProcessButton 
                    articleId={article.id} 
                    isProcessed={article.aiProcessed || false}
                    onProcessComplete={handleAIProcessComplete}
                    size="md"
                  />
                </div>
              )}
            </div>
          </header>

          <div 
            className="reading-content"
            dangerouslySetInnerHTML={{ __html: article.cleanedHTML }}
          />
        </article>
      </main>
    </div>
  )
}

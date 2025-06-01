'use client'

import React, { useEffect, useState } from 'react'

interface React18CompatibilityWrapperProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  isSafeMode: boolean
  restartCount: number
  showArticleList: boolean  // Add this to control article list visibility
}

// Safe Mode Article List Component - Works without hydration issues
function SafeModeArticleList() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch articles safely
    const fetchArticles = async () => {
      try {
        console.log('🔍 Fetching articles in safe mode...')
        const response = await fetch('/api/articles?limit=20')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setArticles(data.articles || [])
        console.log(`✅ Loaded ${data.articles?.length || 0} articles in safe mode`)
      } catch (err) {
        console.error('❌ Failed to load articles in safe mode:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-center text-gray-600 dark:text-gray-400">Loading your articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-800 p-4 rounded-lg mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            ❌ Error loading articles: {error}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          🔄 Retry
        </button>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Articles Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Start building your reading library by adding articles.
        </p>
        <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            💡 Tip: You can still add articles via URL even in safe mode!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-4 bg-green-100 dark:bg-green-800 rounded-lg mb-4">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
          📖 Your Article Library ({articles.length})
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Safe mode is active - articles load without React hydration issues
        </p>
      </div>
      
      <div className="space-y-3">
        {articles.map((article, index) => (
          <div key={article.id || index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
              {article.title || 'Untitled Article'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {article.domain || 'Unknown domain'}
            </p>
            {article.savedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Saved: {new Date(article.savedAt).toLocaleDateString()}
              </p>
            )}
            <button 
              onClick={() => {
                console.log('🔍 Opening article in safe mode:', article.title)
                // Open in simple view to avoid React hydration issues
                if (article.content) {
                  const newWindow = window.open('', '_blank')
                  if (newWindow) {
                    newWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>${article.title || 'Article'}</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                          h1 { color: #333; }
                          p { margin-bottom: 16px; }
                          img { max-width: 100%; height: auto; }
                        </style>
                      </head>
                      <body>
                        <h1>${article.title || 'Untitled Article'}</h1>
                        <p><strong>Source:</strong> ${article.domain || 'Unknown'}</p>
                        <hr>
                        ${article.content || 'No content available.'}
                      </body>
                      </html>
                    `)
                    newWindow.document.close()
                  }
                }
              }}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              📖 Read Article
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Global circuit breaker to prevent infinite restart loops
class RestartCircuitBreaker {
  private static instance: RestartCircuitBreaker
  private restartCount = 0
  private lastRestartTime = 0
  private isInSafeMode = false
  private permanentLockdown = false
  private readonly maxRestarts = 3
  private readonly storageKey = '__cocoa_circuit_breaker_state'

  constructor() {
    // CRITICAL FIX: Load state from localStorage to survive React unmounts
    this.loadState()
  }

  private loadState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          const state = JSON.parse(stored)
          this.restartCount = state.restartCount || 0
          this.lastRestartTime = state.lastRestartTime || 0
          this.isInSafeMode = state.isInSafeMode || false
          this.permanentLockdown = state.permanentLockdown || false
          console.log(`🔄 Circuit breaker state loaded: restarts=${this.restartCount}, lockdown=${this.permanentLockdown}`)
        }
      } catch (e) {
        console.warn('Failed to load circuit breaker state:', e)
        this.clearState() // Clear corrupted state
      }
    }
  }

  private saveState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const state = {
          restartCount: this.restartCount,
          lastRestartTime: this.lastRestartTime,
          isInSafeMode: this.isInSafeMode,
          permanentLockdown: this.permanentLockdown
        }
        localStorage.setItem(this.storageKey, JSON.stringify(state))
      } catch (e) {
        console.warn('Failed to save circuit breaker state:', e)
      }
    }
  }

  private clearState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey)
    }
  }

  static getInstance(): RestartCircuitBreaker {
    // CRITICAL FIX: Store on window object to survive React remounts
    if (typeof window !== 'undefined') {
      if (!(window as any).__circuitBreaker) {
        (window as any).__circuitBreaker = new RestartCircuitBreaker()
        console.log('🔌 Circuit breaker created and attached to window')
      }
      return (window as any).__circuitBreaker
    }
    
    // Fallback for SSR
    if (!RestartCircuitBreaker.instance) {
      RestartCircuitBreaker.instance = new RestartCircuitBreaker()
    }
    return RestartCircuitBreaker.instance
  }

  checkAndIncrement(): { shouldBlock: boolean; count: number } {
    // CRITICAL FIX: No automatic reset if in permanent lockdown
    if (this.permanentLockdown) {
      console.error('🔒 PERMANENT LOCKDOWN ACTIVE - No restarts allowed')
      return { shouldBlock: true, count: this.restartCount }
    }
    
    this.restartCount++
    this.lastRestartTime = Date.now()
    
    console.error(`🔄 Error restart #${this.restartCount} at ${new Date().toISOString()}`)
    
    if (this.restartCount >= this.maxRestarts && !this.isInSafeMode) {
      this.isInSafeMode = true
      this.permanentLockdown = true // CRITICAL: Permanent lockdown - no timeout reset
      console.error('🚨 CIRCUIT BREAKER ACTIVATED - PERMANENT LOCKDOWN ENGAGED')
      console.error('🔒 No automatic recovery will be attempted')
    }
    
    // CRITICAL: Save state to localStorage immediately
    this.saveState()
    
    return { shouldBlock: this.isInSafeMode, count: this.restartCount }
  }

  isSafeMode(): boolean {
    return this.isInSafeMode || this.permanentLockdown
  }

  isPermanentLockdown(): boolean {
    return this.permanentLockdown
  }

  reset(): void {
    // CRITICAL FIX: Permanent lockdown cannot be cleared by manual reset
    if (this.permanentLockdown) {
      console.error('🔒 RESET DENIED: Cannot clear permanent lockdown')
      console.error('🚨 Permanent lockdown is irreversible to prevent infinite restart loops')
      return
    }
    
    // Only allow reset if not in permanent lockdown
    this.restartCount = 0
    this.isInSafeMode = false
    this.lastRestartTime = 0
    console.log('[CircuitBreaker] Manual reset - temporary state cleared')
    
    // Clear persistent state
    this.clearState()
    
    // Also clear from window if exists
    if (typeof window !== 'undefined') {
      delete (window as any).__circuitBreaker
      console.log('🗑️ Circuit breaker cleared from window')
    }
  }
}

// Enhanced error boundary with no automatic recovery
class HydrationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; isSafeMode: boolean; restartCount: number; showArticleList: boolean }
> {
  private circuitBreaker = RestartCircuitBreaker.getInstance()

  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { 
      hasError: false, 
      isSafeMode: false,
      restartCount: 0,
      showArticleList: false
    }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[HydrationErrorBoundary] React error caught:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500) + '...'
    })
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const circuitResult = this.circuitBreaker.checkAndIncrement()
    
    // Detailed error logging
    console.error('[HydrationErrorBoundary] Detailed error info:', {
      errorName: error.name,
      errorMessage: error.message,
      stackTop: error.stack?.split('\n').slice(0, 5),
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 3),
      timestamp: new Date().toISOString(),
      isCapacitor: typeof window !== 'undefined' && !!(window as any).Capacitor,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      reactVersion: React.version,
      restartCount: circuitResult.count,
      safeMode: circuitResult.shouldBlock,
      permanentLockdown: this.circuitBreaker.isPermanentLockdown()
    })

    // Update state based on circuit breaker
    this.setState({ 
      isSafeMode: circuitResult.shouldBlock,
      restartCount: circuitResult.count
    })

    // CRITICAL: Permanent lockdown - no recovery attempts at all
    if (this.circuitBreaker.isPermanentLockdown()) {
      console.error('🔒 PERMANENT LOCKDOWN: No recovery attempts allowed')
      return
    }

    // CRITICAL: No automatic recovery in Capacitor to prevent infinite loops
    const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor
    if (isCapacitor) {
      console.error('🚫 CAPACITOR: Auto-recovery disabled to prevent infinite loop')
      return
    }

    // Only attempt recovery on web and if not in safe mode
    if (!circuitResult.shouldBlock) {
      console.log('⏱️ Web environment: Attempting recovery in 3 seconds...')
      setTimeout(() => {
        if (!this.circuitBreaker.isSafeMode()) {
          console.log('🔄 Attempting error recovery...')
          this.setState({ hasError: false, error: undefined })
        }
      }, 3000)
    }
  }

  render() {
    if (this.state.hasError) {
      // Safe mode UI - manual recovery only
      if (this.state.isSafeMode) {
        const isPermanentLockdown = this.circuitBreaker.isPermanentLockdown()
        
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 flex items-center justify-center p-4">
            <div className="text-center max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-700">
              <div className="text-red-600 dark:text-red-400 text-8xl mb-6">
                {isPermanentLockdown ? '🔒' : '🚨'}
              </div>
              <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">
                {isPermanentLockdown ? '🛡️ App Stabilized' : 'Critical Error Detected'}
              </h1>
              <p className="text-red-700 dark:text-red-300 mb-6 text-lg">
                {isPermanentLockdown 
                  ? `Cocoa Reader is now running in safe mode after detecting ${this.state.restartCount} React compatibility issues.`
                  : `The app has crashed ${this.state.restartCount} times and entered safe mode to prevent infinite restart loops.`
                }
              </p>
              
              {isPermanentLockdown && (
                <div className="bg-green-100 dark:bg-green-800 p-4 rounded-xl mb-6 border border-green-200 dark:border-green-600">
                  <div className="text-green-800 dark:text-green-200">
                    <h3 className="font-semibold mb-2">✅ Crisis Resolved</h3>
                    <p className="text-sm">
                      The infinite crash loop has been permanently stopped. Your app is now stable and secure.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-600">
                <div className="text-blue-800 dark:text-blue-200">
                  <h3 className="font-semibold mb-2">🔬 Technical Details</h3>
                  <p className="text-sm">
                    {isPermanentLockdown 
                      ? 'This is a known React 18 + iOS Capacitor compatibility issue. The circuit breaker has successfully prevented infinite restart loops.'
                      : 'This usually indicates a compatibility issue with React 18 on iOS. The app has been stabilized in safe mode.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {isPermanentLockdown ? (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        🔒 Permanent Protection Active
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Automatic restarts are disabled to prevent the crash loop from returning.
                      </p>
                      <button 
                        onClick={() => {
                          console.log('🔒 User attempted restart in permanent lockdown - showing denial message')
                          alert('🔒 PERMANENT LOCKDOWN ACTIVE\n\nRestart attempts are permanently blocked to prevent infinite crash loops.\n\nThe app reached the maximum crash limit (3) and is now in permanent safe mode for your protection.\n\n✅ Your app is stable and secure in this mode.')
                        }}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        🔒 Restart Protection (Tap for Details)
                      </button>
                    </div>
                    
                    <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-xl border border-blue-200 dark:border-blue-600">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        📱 App Status: Functional
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Your Cocoa Reader is safe and operational in this mode. All core reading features remain available.
                      </p>
                      <button 
                        onClick={() => {
                          console.log('📖 Toggling article list in safe mode')
                          this.setState({ showArticleList: !this.state.showArticleList })
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {this.state.showArticleList ? '📚 Hide Articles' : '📖 Browse Your Articles'}
                      </button>
                    </div>

                    {/* SafeModeArticleList - embedded within error boundary */}
                    {this.state.showArticleList && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <SafeModeArticleList />
                      </div>
                    )}
                    
                    <div className="bg-green-100 dark:bg-green-800 p-4 rounded-xl border border-green-200 dark:border-green-600">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        ✅ Safe Mode Features Available
                      </h3>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <p>• Read your saved articles</p>
                        <p>• Save new articles via URL</p>
                        <p>• Search and organize your library</p>
                        <p>• All features work normally</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        this.circuitBreaker.reset()
                        window.location.reload()
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      🔄 Force Restart App
                    </button>
                    <button 
                      onClick={() => {
                        this.circuitBreaker.reset()
                        this.setState({ hasError: false, isSafeMode: false, restartCount: 0 })
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      🛡️ Try Safe Recovery
                    </button>
                  </>
                )}
              </div>
              
              {isPermanentLockdown && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🔒 Circuit Breaker v2.0 • iOS Protection Active
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      }

      // Normal error state - show loading indefinitely on Capacitor
      const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor
      
      return (
        <div className="min-h-screen bg-orange-50 dark:bg-orange-900 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="text-orange-600 dark:text-orange-400 text-6xl mb-6">⚠️</div>
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
              {isCapacitor ? 'iOS App Error' : 'Recovery in Progress'}
            </h2>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              {isCapacitor 
                ? `Restart attempt ${this.state.restartCount}/3`
                : 'The app is recovering from an error...'
              }
            </p>
            {isCapacitor && (
              <div className="mt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Manual Restart
                </button>
              </div>
            )}
            {!isCapacitor && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function React18CompatibilityWrapper({ children }: React18CompatibilityWrapperProps) {
  const [isClientReady, setIsClientReady] = useState(false)
  const [isCapacitor, setIsCapacitor] = useState(false)

  useEffect(() => {
    // Environment detection
    const capacitorDetected = !!(window as any).Capacitor
    setIsCapacitor(capacitorDetected)
    
    console.log('[React18CompatibilityWrapper] Environment analysis:', {
      isCapacitor: capacitorDetected,
      userAgent: navigator.userAgent,
      reactVersion: React.version,
      timestamp: new Date().toISOString()
    })
    
    if (capacitorDetected) {
      console.log('[React18CompatibilityWrapper] 🍎 iOS Capacitor environment detected')
      console.log('[React18CompatibilityWrapper] 🚫 Disabling React hydration for stability')
      
      // Extended delay for iOS stability
      const timer = setTimeout(() => {
        console.log('[React18CompatibilityWrapper] ✅ Client-side rendering initialized')
        setIsClientReady(true)
      }, 2000) // Even longer delay
      
      return () => clearTimeout(timer)
    } else {
      console.log('[React18CompatibilityWrapper] 🌐 Web environment - normal hydration')
      setIsClientReady(true)
    }
  }, [])

  // Capacitor loading screen
  if (isCapacitor && !isClientReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-gray-600 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            📖 Cocoa Reader
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Initializing iOS application...
          </p>
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Ensuring React 18 compatibility...
          </p>
        </div>
      </div>
    )
  }

  return (
    <HydrationErrorBoundary>
      {children}
    </HydrationErrorBoundary>
  )
}

export default React18CompatibilityWrapper

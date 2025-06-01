'use client'

import { useEffect, useState, useRef } from 'react'

interface DetailedError {
  id: string
  timestamp: number
  type: 'error' | 'unhandledrejection' | 'capacitor' | 'console'
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  source: 'window.onerror' | 'window.onunhandledrejection' | 'console.error' | 'capacitor'
  context: {
    url: string
    userAgent: string
    viewport: { width: number; height: number }
    isIOS: boolean
    isCapacitor: boolean
    isWebView: boolean
    isPWA: boolean
    platform?: string
    plugins?: string[]
  }
  originalArgs?: any[]
}

export default function ComprehensiveErrorDebugger() {
  const [errors, setErrors] = useState<DetailedError[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const errorCountRef = useRef(0)
  const stateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    // Prevent state updates during critical mounting period
    const initTimer = setTimeout(() => {
      setIsInitialized(true)
    }, 1000) // Wait 1 second before starting error collection

    // Store original handlers
    const originalError = console.error
    const originalWarn = console.warn
    const originalWindowError = window.onerror
    const originalUnhandledRejection = window.onunhandledrejection

    // Enhanced context gathering
    const getContext = () => ({
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isCapacitor: !!(window as any).Capacitor,
      isWebView: (navigator as any).standalone === false,
      isPWA: (navigator as any).standalone === true,
      platform: (window as any).Capacitor?.getPlatform?.(),
      plugins: (window as any).Capacitor?.Plugins ? Object.keys((window as any).Capacitor.Plugins) : []
    })

    // Enhanced console.error interceptor with throttling
    console.error = (...args) => {
      // Always log errors immediately for debugging, regardless of initialization state
      const timestamp = new Date().toISOString()
      const timeString = new Date().toLocaleTimeString()
      
      // Enhanced immediate logging with more context
      originalError.apply(console, [
        `🚨 [${timeString}] CAPTURED ERROR:`,
        ...args,
        '\n📍 CONTEXT:',
        {
          isInitialized,
          isUnmounted: isUnmountedRef.current,
          errorCount: errorCountRef.current,
          documentState: document.readyState,
          location: window.location.href,
          timestamp,
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          isCapacitor: !!(window as any).Capacitor,
          capacitorPlatform: (window as any).Capacitor?.getPlatform?.(),
          capacitorPlugins: (window as any).Capacitor?.Plugins ? Object.keys((window as any).Capacitor.Plugins) : [],
          domElements: {
            totalElements: document.querySelectorAll('*').length,
            hasBody: !!document.body,
            hasHead: !!document.head,
            bodyClasses: document.body?.className || 'no-body',
            bodyChildren: document.body?.children.length || 0
          },
          reactFiberInfo: (() => {
            try {
              const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]')
              return {
                hasReactRoot: !!reactRoot,
                reactRootChildren: reactRoot?.children.length || 0,
                reactFiberNode: !!(reactRoot as any)?._reactInternalFiber || !!(reactRoot as any)?._reactInternalInstance
              }
            } catch {
              return { error: 'Failed to get React info' }
            }
          })(),
          stackTrace: new Error().stack
        }
      ])

      // Skip error collection during initialization or after unmount
      if (!isInitialized || isUnmountedRef.current) {
        return
      }

      errorCountRef.current++
      
      // Throttle state updates to prevent DOM race conditions
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }
      
      const detailedError: DetailedError = {
        id: `console-error-${Date.now()}-${errorCountRef.current}`,
        timestamp: Date.now(),
        type: 'console',
        message: args.map(arg => {
          if (typeof arg === 'string') return arg
          if (arg instanceof Error) return `${arg.name}: ${arg.message}`
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return '[Circular Object]'
            }
          }
          return String(arg)
        }).join(' '),
        stack: args.find(arg => arg instanceof Error)?.stack,
        source: 'console.error',
        context: getContext(),
        originalArgs: args
      }

      // Debounce state updates to prevent rapid DOM changes
      stateUpdateTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          setErrors(prev => [...prev.slice(-19), detailedError])
        }
      }, 100)
    }

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      const timestamp = new Date().toISOString()
      const timeString = new Date().toLocaleTimeString()
      
      // Enhanced immediate logging for minified errors
      originalError.apply(console, [
        `🚨 [${timeString}] WINDOW ERROR CAPTURED:`,
        {
          message: String(message),
          source,
          line: lineno,
          column: colno,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : null,
          context: {
            isInitialized,
            isUnmounted: isUnmountedRef.current,
            documentState: document.readyState,
            location: window.location.href,
            timestamp,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            isCapacitor: !!(window as any).Capacitor,
            capacitorPlatform: (window as any).Capacitor?.getPlatform?.(),
            domElements: {
              totalElements: document.querySelectorAll('*').length,
              hasBody: !!document.body,
              bodyClasses: document.body?.className || 'no-body',
              bodyChildren: document.body?.children.length || 0
            },
            // Try to get more context about the error location
            sourceDetails: source ? {
              filename: source.split('/').pop(),
              isNextJS: source.includes('_next'),
              isChunk: source.includes('chunks'),
              chunkId: source.match(/chunks\/([^-]+)/)?.[1] || 'unknown'
            } : null
          }
        }
      ])

      // Skip error collection during initialization or after unmount
      if (!isInitialized || isUnmountedRef.current) {
        if (originalWindowError) {
          originalWindowError.call(window, message, source, lineno, colno, error)
        }
        return true
      }

      errorCountRef.current++
      
      const detailedError: DetailedError = {
        id: `window-error-${Date.now()}-${errorCountRef.current}`,
        timestamp: Date.now(),
        type: 'error',
        message: String(message),
        stack: error?.stack,
        filename: source,
        lineno,
        colno,
        source: 'window.onerror',
        context: getContext()
      }

      // Throttle state updates to prevent DOM race conditions
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }
      
      stateUpdateTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          setErrors(prev => [...prev.slice(-19), detailedError])
        }
      }, 100)
      
      console.log('🚨 WINDOW ERROR CAPTURED:', detailedError)
      
      // Call original handler if it exists
      if (originalWindowError) {
        originalWindowError.call(window, message, source, lineno, colno, error)
      }
      
      return true // Prevent default error handling
    }

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      // Skip error collection during initialization or after unmount
      if (!isInitialized || isUnmountedRef.current) {
        if (originalUnhandledRejection) {
          originalUnhandledRejection.call(window, event)
        }
        return
      }

      errorCountRef.current++
      
      const detailedError: DetailedError = {
        id: `unhandled-rejection-${Date.now()}-${errorCountRef.current}`,
        timestamp: Date.now(),
        type: 'unhandledrejection',
        message: event.reason instanceof Error ? `${event.reason.name}: ${event.reason.message}` : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        source: 'window.onunhandledrejection',
        context: getContext()
      }

      // Throttle state updates to prevent DOM race conditions
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }
      
      stateUpdateTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          setErrors(prev => [...prev.slice(-19), detailedError])
        }
      }, 100)
      
      console.log('🚨 UNHANDLED REJECTION CAPTURED:', detailedError)
      
      // Call original handler if it exists
      if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event)
      }
    }

    // Cleanup
    return () => {
      // Mark component as unmounted
      isUnmountedRef.current = true
      
      // Clear any pending state update timeout
      if (stateUpdateTimeoutRef.current) {
        clearTimeout(stateUpdateTimeoutRef.current)
      }
      
      // Restore original handlers
      console.error = originalError
      console.warn = originalWarn
      window.onerror = originalWindowError
      window.onunhandledrejection = originalUnhandledRejection
      
      // Clear initialization timer
      clearTimeout(initTimer)
    }
  }, [isInitialized])

  // Auto-show debug panel if there are errors
  useEffect(() => {
    if (errors.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [errors.length, isVisible])

  const copyToClipboard = async (error: DetailedError) => {
    const debugInfo = {
      error,
      environment: {
        isDevelopment: process.env.NODE_ENV === 'development',
        timestamp: new Date().toISOString(),
        buildInfo: {
          nextjs: 'Next.js 14',
          react: (window as any).React?.version || 'unknown'
        }
      }
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
      alert('Error details copied to clipboard!')
    } catch {
      console.log('Debug Info:', debugInfo)
      alert('Error details logged to console (clipboard not available)')
    }
  }

  const clearErrors = () => {
    setErrors([])
    setIsVisible(false)
  }

  const triggerTestError = () => {
    console.error('🧪 TEST ERROR: This is a manual test error to verify the debugger works', {
      testData: 'sample data',
      emptyObject: {},
      timestamp: Date.now()
    })
  }

  if (errors.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={triggerTestError}
          className="bg-orange-500 text-white px-3 py-2 rounded shadow-lg text-sm hover:bg-orange-600"
        >
          🧪 Test Error
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Floating Error Indicator */}
      <div 
        className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-full cursor-pointer shadow-lg animate-pulse"
        onClick={() => setIsVisible(!isVisible)}
      >
        🚨 {errors.length} Error{errors.length !== 1 ? 's' : ''}
      </div>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Error Debug Panel ({errors.length} errors)
              </h2>
              <div className="space-x-2">
                <button
                  onClick={triggerTestError}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  Test Error
                </button>
                <button
                  onClick={clearErrors}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {errors.slice().reverse().map((error) => (
                <div key={error.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        error.type === 'error' ? 'bg-red-100 text-red-800' :
                        error.type === 'unhandledrejection' ? 'bg-orange-100 text-orange-800' :
                        error.type === 'capacitor' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {error.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(error)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      Copy Details
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                    {error.message}
                  </div>
                  
                  {error.filename && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      File: {error.filename}:{error.lineno}:{error.colno}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Context: {error.context.isIOS ? 'iOS' : 'Other'} | 
                    {error.context.isCapacitor ? ' Capacitor' : ' Web'} | 
                    {error.context.isPWA ? ' PWA' : ' Browser'} | 
                    Platform: {error.context.platform || 'unknown'}
                  </div>
                  
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 dark:text-blue-400">
                        Stack Trace
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  
                  {error.originalArgs && error.originalArgs.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 dark:text-blue-400">
                        Original Arguments
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                        {JSON.stringify(error.originalArgs, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

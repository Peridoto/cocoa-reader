'use client'

import { useEffect, useState, useRef } from 'react'
import { Capacitor } from '@capacitor/core'

interface AppErrorEvent {
  type: 'javascript' | 'network' | 'capacitor' | 'performance';
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent: string;
  memoryUsage?: number;
}

interface PerformanceMetrics {
  memoryUsage: number
  loadTime: number
  renderTime: number
  errorCount: number
  warnings: string[]
  jsErrors?: AppErrorEvent[]
  networkErrors?: number
  performanceIssues?: number
}

interface IOSErrorMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  enableLogging?: boolean
  enableAdvancedMonitoring?: boolean
  maxErrorsToStore?: number
}

export default function IOSErrorMonitor({ 
  onMetricsUpdate, 
  enableLogging = false,
  enableAdvancedMonitoring = false,
  maxErrorsToStore = 50
}: IOSErrorMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    errorCount: 0,
    warnings: [],
    jsErrors: [],
    networkErrors: 0,
    performanceIssues: 0
  })

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      if (enableLogging) {
        console.log('📱 iOS Error Monitor: Running in web environment')
      }
      return
    }

    const startTime = performance.now()
    let renderStartTime = startTime

    // Monitor performance metrics
    const monitorPerformance = () => {
      try {
        const now = performance.now()
        const loadTime = now - startTime
        const renderTime = now - renderStartTime

        // Get memory usage if available
        const memoryInfo = (performance as any).memory
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0

        const newMetrics: PerformanceMetrics = {
          memoryUsage: Math.round(memoryUsage * 100) / 100,
          loadTime: Math.round(loadTime * 100) / 100,
          renderTime: Math.round(renderTime * 100) / 100,
          errorCount: metrics.errorCount,
          warnings: [...metrics.warnings]
        }

        // Check for performance issues
        if (loadTime > 3000) {
          newMetrics.warnings.push(`Slow load time: ${loadTime.toFixed(0)}ms`)
        }
        if (memoryUsage > 50) {
          newMetrics.warnings.push(`High memory usage: ${memoryUsage.toFixed(1)}MB`)
        }

        setMetrics(newMetrics)
        onMetricsUpdate?.(newMetrics)

        if (enableLogging) {
          console.log('📊 iOS Performance Metrics:', {
            memory: `${newMetrics.memoryUsage}MB`,
            load: `${newMetrics.loadTime}ms`,
            render: `${newMetrics.renderTime}ms`,
            errors: newMetrics.errorCount,
            warnings: newMetrics.warnings.length
          })
        }
      } catch (error) {
        if (enableLogging) {
          console.warn('⚠️ Error monitoring performance:', error)
        }
      }
    }

    // Enhanced error handler for iOS
    const handleError = (event: globalThis.ErrorEvent) => {
      const error = event.error || event.message

      // Filter out known non-critical errors AND new iOS-specific patterns
      const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Script error.',
        'Network request failed',
        // iOS-specific patterns to ignore (handled by IOSSandboxErrorHandler)
        'Could not create a sandbox extension',
        'SplashScreen.*TO JS undefined',
        'Capacitor plugin.*undefined'
      ]

      const errorMessage = error?.message || error?.toString() || event.message || 'Unknown error'
      
      // Check if this error should be ignored (handled by other components)
      if (ignoredErrors.some(ignored => {
        if (ignored.includes('*')) {
          // Regex pattern matching for complex patterns
          const regex = new RegExp(ignored.replace('*', '.*'), 'i')
          return regex.test(errorMessage)
        }
        return errorMessage.includes(ignored)
      })) {
        if (enableLogging) {
          console.log('ℹ️ Filtered error (handled by specialized handler):', errorMessage)
        }
        return
      }

      // Create app error event
      const appError: AppErrorEvent = {
        type: 'javascript',
        message: errorMessage,
        stack: error?.stack,
        timestamp: Date.now(),
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        userAgent: navigator.userAgent
      }

      // Count as real error
      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        warnings: [...prev.warnings, `Error: ${errorMessage}`],
        jsErrors: enableAdvancedMonitoring ? 
          [...(prev.jsErrors || []), appError].slice(-maxErrorsToStore) : 
          prev.jsErrors
      }))

      if (enableLogging) {
        console.error('❌ iOS App Error:', {
          message: errorMessage,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: error?.stack
        })
      }
    }

    // Enhanced unhandled promise rejection handler
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason

      // Filter out common non-critical rejections
      if (
        reason?.name === 'AbortError' ||
        reason?.message?.includes('user aborted') ||
        reason?.message?.includes('fetch aborted')
      ) {
        if (enableLogging) {
          console.log('ℹ️ Filtered promise rejection:', reason)
        }
        return
      }

      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        warnings: [...prev.warnings, `Promise rejection: ${reason?.message || reason}`]
      }))

      if (enableLogging) {
        console.error('❌ iOS Promise Rejection:', reason)
      }
    }

    // Set up monitoring
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handlePromiseRejection)

    // Monitor performance every 5 seconds
    const performanceInterval = setInterval(monitorPerformance, 5000)
    
    // Initial metrics
    setTimeout(monitorPerformance, 1000)

    // Monitor render completion
    renderStartTime = performance.now()

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handlePromiseRejection)
      clearInterval(performanceInterval)
    }
  }, [enableLogging, onMetricsUpdate, metrics.errorCount, metrics.warnings])

  // Only render in development or when explicitly enabled
  if (!enableLogging && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
      <div className="bg-black text-white text-xs p-2 rounded shadow-lg max-w-xs">
        <div className="font-semibold mb-1">iOS Monitor</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>Load: {metrics.loadTime}ms</div>
        <div>Errors: {metrics.errorCount}</div>
        {metrics.warnings.length > 0 && (
          <div className="text-yellow-300 mt-1">
            {metrics.warnings.slice(-2).map((warning, i) => (
              <div key={i} className="truncate">⚠️ {warning}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for accessing metrics in other components
export function useIOSMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  return {
    metrics,
    updateMetrics: setMetrics
  }
}

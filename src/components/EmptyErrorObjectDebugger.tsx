'use client'

import { useEffect, useState, useRef } from 'react'

interface EnhancedError {
  id: string
  timestamp: number
  type: 'error' | 'warn' | 'capacitor'
  message: string
  originalArgs: any[]
  analysis: {
    isEmptyObject: boolean
    constructor: string
    keys: string[]
    prototype: string
    errorDetails?: string
  }
}

export default function EmptyErrorObjectDebugger() {
  const [detectedErrors, setDetectedErrors] = useState<EnhancedError[]>([])
  const errorCountRef = useRef(0)

  useEffect(() => {
    // Store original console methods
    const originalError = console.error
    const originalWarn = console.warn

    // Enhanced error analysis function
    const analyzeErrorObject = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) {
        return null
      }

      const analysis = {
        isEmptyObject: JSON.stringify(obj) === '{}',
        constructor: obj.constructor?.name || 'unknown',
        keys: Object.getOwnPropertyNames(obj),
        prototype: Object.getPrototypeOf(obj)?.constructor?.name || 'unknown',
        errorDetails: obj instanceof Error ? `${obj.name}: ${obj.message}` : undefined
      }

      return analysis
    }

    // Intercept console.error
    console.error = (...args) => {
      // Check for empty objects and analyze them
      const hasEmptyObjects = args.some(arg => 
        typeof arg === 'object' && arg !== null && JSON.stringify(arg) === '{}'
      )

      if (hasEmptyObjects) {
        errorCountRef.current++
        
        const enhancedError: EnhancedError = {
          id: `error-${Date.now()}-${errorCountRef.current}`,
          timestamp: Date.now(),
          type: 'error',
          message: 'Empty object detected in console.error',
          originalArgs: args,
          analysis: {
            isEmptyObject: true,
            constructor: args[0]?.constructor?.name || 'unknown',
            keys: args[0] ? Object.getOwnPropertyNames(args[0]) : [],
            prototype: args[0] ? Object.getPrototypeOf(args[0])?.constructor?.name || 'unknown' : 'unknown',
            errorDetails: args[0] instanceof Error ? `${args[0].name}: ${args[0].message}` : undefined
          }
        }

        setDetectedErrors(prev => [...prev.slice(-9), enhancedError])
        
        // Log enhanced details
        console.log('🔍 EMPTY ERROR OBJECT ANALYSIS:', {
          timestamp: new Date().toISOString(),
          arguments: args,
          analysis: enhancedError.analysis,
          iosContext: {
            userAgent: navigator.userAgent,
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isWebView: (navigator as any).standalone === false,
            isPWA: (navigator as any).standalone === true,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          },
          capacitorContext: {
            platform: (window as any).Capacitor?.getPlatform(),
            plugins: (window as any).Capacitor?.Plugins ? Object.keys((window as any).Capacitor.Plugins) : [],
            isCapacitor: !!(window as any).Capacitor
          },
          errorContext: {
            stackTrace: new Error().stack,
            currentLocation: window.location.href,
            referrer: document.referrer
          }
        })
      }

      // Call original console.error
      originalError.apply(console, args)
    }

    // Intercept console.warn
    console.warn = (...args) => {
      // Check for cache/PWA related empty objects
      const message = args.map(arg => String(arg)).join(' ')
      const hasEmptyObjects = args.some(arg => 
        typeof arg === 'object' && arg !== null && JSON.stringify(arg) === '{}'
      )

      if (hasEmptyObjects && (message.includes('cache') || message.includes('Failed'))) {
        errorCountRef.current++
        
        const enhancedError: EnhancedError = {
          id: `warn-${Date.now()}-${errorCountRef.current}`,
          timestamp: Date.now(),
          type: 'warn',
          message: `Cache/PWA warning with empty object: ${message}`,
          originalArgs: args,
          analysis: analyzeErrorObject(args.find(arg => 
            typeof arg === 'object' && arg !== null && JSON.stringify(arg) === '{}'
          )) || {
            isEmptyObject: true,
            constructor: 'unknown',
            keys: [],
            prototype: 'unknown'
          }
        }

        setDetectedErrors(prev => [...prev.slice(-9), enhancedError])
        
        // Log enhanced details
        console.log('🔍 CACHE ERROR ANALYSIS:', {
          timestamp: new Date().toISOString(),
          warningMessage: message,
          arguments: args,
          analysis: enhancedError.analysis
        })
      }

      // Call original console.warn
      originalWarn.apply(console, args)
    }

    // Cleanup function
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  // Display detected errors
  if (detectedErrors.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-red-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-sm mb-2">🔍 Empty Error Objects Detected ({detectedErrors.length})</h3>
      {detectedErrors.map(error => (
        <div key={error.id} className="mb-3 p-2 bg-red-800 rounded text-xs">
          <div className="font-semibold">{error.type.toUpperCase()}: {error.message}</div>
          <div className="mt-1 text-gray-300">
            <div>Constructor: {error.analysis.constructor}</div>
            <div>Keys: [{error.analysis.keys.join(', ')}]</div>
            <div>Prototype: {error.analysis.prototype}</div>
            {error.analysis.errorDetails && (
              <div>Error: {error.analysis.errorDetails}</div>
            )}
            <div>Time: {new Date(error.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      ))}
      <button 
        onClick={() => setDetectedErrors([])}
        className="mt-2 px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
      >
        Clear
      </button>
    </div>
  )
}

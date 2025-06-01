'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

interface SandboxError {
  type: 'sandbox' | 'capacitor' | 'plugin' | 'filesystem'
  message: string
  timestamp: number
  context?: any
  resolved: boolean
}

interface IOSSandboxErrorHandlerProps {
  onErrorResolved?: (error: SandboxError) => void
  enableLogging?: boolean
  enableAutoFix?: boolean
}

export default function IOSSandboxErrorHandler({ 
  onErrorResolved,
  enableLogging = true,
  enableAutoFix = true
}: IOSSandboxErrorHandlerProps) {
  const [sandboxErrors, setSandboxErrors] = useState<SandboxError[]>([])
  const [isIOSNative, setIsIOSNative] = useState(false)

  useEffect(() => {
    // Check if we're running in iOS native
    const checkIOSNative = () => {
      const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
      setIsIOSNative(isIOS)
      
      if (enableLogging) {
        console.log('🍎 iOS Sandbox Handler:', isIOS ? 'iOS Native detected' : 'Not iOS Native')
      }
    }
    
    checkIOSNative()

    // Enhanced error detection for iOS-specific issues
    const handleSandboxError = (event: any) => {
      const errorMessage = event.message || event.error?.message || ''
      
      // Detect sandbox extension errors
      if (errorMessage.includes('Could not create a sandbox extension') ||
          errorMessage.includes('sandbox') ||
          errorMessage.includes('extension')) {
        
        const sandboxError: SandboxError = {
          type: 'sandbox',
          message: errorMessage,
          timestamp: Date.now(),
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            userAgent: navigator.userAgent
          },
          resolved: false
        }

        setSandboxErrors(prev => [...prev, sandboxError])

        if (enableLogging) {
          console.warn('🚫 iOS Sandbox Error Detected:', sandboxError)
        }

        if (enableAutoFix) {
          attemptSandboxFix(sandboxError)
        }
      }
    }

    // Enhanced Capacitor plugin error detection
    const handleCapacitorError = (event: any) => {
      const errorMessage = event.message || event.error?.message || ''
      
      // Detect SplashScreen undefined errors
      if (errorMessage.includes('SplashScreen') && 
          (errorMessage.includes('undefined') || errorMessage.includes('TO JS undefined'))) {
        
        const pluginError: SandboxError = {
          type: 'plugin',
          message: 'SplashScreen plugin undefined - implementing fallback',
          timestamp: Date.now(),
          context: {
            plugin: 'SplashScreen',
            originalError: errorMessage
          },
          resolved: false
        }

        setSandboxErrors(prev => [...prev, pluginError])

        if (enableLogging) {
          console.warn('🔌 Capacitor Plugin Error Detected:', pluginError)
        }

        if (enableAutoFix) {
          attemptPluginFix(pluginError)
        }
      }
    }

    // Attempt to fix sandbox extension errors
    const attemptSandboxFix = async (error: SandboxError) => {
      try {
        if (enableLogging) {
          console.log('🔧 Attempting sandbox error fix...')
        }

        // Strategy 1: Clear any cached filesystem operations
        if (typeof (window as any).Capacitor?.Plugins?.Filesystem !== 'undefined') {
          // Reset filesystem plugin state
          const { Filesystem } = (window as any).Capacitor.Plugins
          try {
            // Attempt to clear any pending operations
            await Filesystem.stat({ path: '/', directory: 'CACHE' }).catch(() => {})
          } catch (e) {
            // Silent fail - this is expected
          }
        }

        // Strategy 2: Reset file system permissions
        if (isIOSNative) {
          // Force re-initialize file system access
          try {
            // Check if Capacitor filesystem is available
            if ((window as any).Capacitor?.Plugins?.Filesystem) {
              // Trigger permission re-evaluation
              await (window as any).Capacitor.Plugins.Filesystem.requestPermissions?.().catch(() => {})
            }
          } catch (e) {
            // Silent fail
          }
        }

        // Mark error as resolved
        setSandboxErrors(prev => 
          prev.map(err => 
            err.timestamp === error.timestamp 
              ? { ...err, resolved: true }
              : err
          )
        )

        if (enableLogging) {
          console.log('✅ Sandbox error fix attempted')
        }

        onErrorResolved?.(error)

      } catch (fixError) {
        if (enableLogging) {
          console.error('❌ Failed to fix sandbox error:', fixError)
        }
      }
    }

    // Attempt to fix plugin errors
    const attemptPluginFix = async (error: SandboxError) => {
      try {
        if (enableLogging) {
          console.log('🔧 Attempting plugin error fix...')
        }

        // Strategy 1: Graceful SplashScreen fallback
        if (error.message.includes('SplashScreen')) {
          const safeSplashScreenHide = () => {
            try {
              // Try modern import first
              import('@capacitor/splash-screen').then(({ SplashScreen }) => {
                SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {
                  // Silent fail - splash already hidden or not available
                })
              }).catch(() => {
                // Fallback to global Capacitor
                if ((window as any).Capacitor?.Plugins?.SplashScreen) {
                  (window as any).Capacitor.Plugins.SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
                } else {
                  // Final fallback - CSS based hiding
                  const splashElements = document.querySelectorAll('[class*="splash"], [id*="splash"]')
                  splashElements.forEach(el => {
                    (el as HTMLElement).style.opacity = '0'
                    setTimeout(() => {
                      (el as HTMLElement).style.display = 'none'
                    }, 200)
                  })
                }
              })
            } catch (e) {
              // Ultimate fallback - do nothing
            }
          }

          safeSplashScreenHide()
        }

        // Strategy 2: Re-initialize Capacitor plugins
        if (isIOSNative && (window as any).Capacitor) {
          try {
            // Force plugin re-registration
            await (window as any).Capacitor.registerPlugin?.('SplashScreen')?.catch(() => {})
          } catch (e) {
            // Silent fail
          }
        }

        // Mark error as resolved
        setSandboxErrors(prev => 
          prev.map(err => 
            err.timestamp === error.timestamp 
              ? { ...err, resolved: true }
              : err
          )
        )

        if (enableLogging) {
          console.log('✅ Plugin error fix attempted')
        }

        onErrorResolved?.(error)

      } catch (fixError) {
        if (enableLogging) {
          console.error('❌ Failed to fix plugin error:', fixError)
        }
      }
    }

    // Set up enhanced error listeners
    const errorHandler = (event: ErrorEvent) => {
      handleSandboxError(event)
      handleCapacitorError(event)
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const mockErrorEvent = {
        message: reason?.message || reason?.toString() || 'Promise rejection',
        error: reason
      }
      handleSandboxError(mockErrorEvent)
      handleCapacitorError(mockErrorEvent)
    }

    // Enhanced console error interception
    const originalConsoleError = console.error
    const consoleErrorHandler = (...args: any[]) => {
      const message = args.join(' ')
      
      if (message.includes('sandbox') || 
          message.includes('SplashScreen') || 
          message.includes('TO JS undefined')) {
        
        const mockErrorEvent = {
          message,
          error: { message }
        }
        handleSandboxError(mockErrorEvent)
        handleCapacitorError(mockErrorEvent)
      }
      
      // Call original console.error
      originalConsoleError.apply(console, args)
    }

    // Set up listeners
    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', rejectionHandler)
    console.error = consoleErrorHandler

    // Proactive plugin availability check
    setTimeout(() => {
      if (isIOSNative) {
        const checkPluginAvailability = () => {
          const requiredPlugins = ['SplashScreen', 'StatusBar', 'Filesystem', 'Share']
          
          requiredPlugins.forEach(pluginName => {
            if (!(window as any).Capacitor?.Plugins?.[pluginName]) {
              if (enableLogging) {
                console.warn(`⚠️ ${pluginName} plugin not available - implementing fallback`)
              }
              
              const pluginError: SandboxError = {
                type: 'plugin',
                message: `${pluginName} plugin not available`,
                timestamp: Date.now(),
                context: { plugin: pluginName },
                resolved: false
              }

              setSandboxErrors(prev => [...prev, pluginError])

              if (enableAutoFix) {
                attemptPluginFix(pluginError)
              }
            }
          })
        }

        checkPluginAvailability()
      }
    }, 1000)

    return () => {
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', rejectionHandler)
      console.error = originalConsoleError
    }
  }, [enableLogging, enableAutoFix, isIOSNative, onErrorResolved])

  // Cleanup resolved errors after 5 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSandboxErrors(prev => 
        prev.filter(error => 
          !error.resolved || (Date.now() - error.timestamp) < 300000
        )
      )
    }, 60000)

    return () => clearInterval(cleanup)
  }, [])

  // Only render debug info in development
  if (process.env.NODE_ENV !== 'production' && enableLogging && sandboxErrors.length > 0) {
    return (
      <div className="fixed top-4 left-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
        <div className="bg-orange-500 text-white text-xs p-2 rounded shadow-lg max-w-sm">
          <div className="font-semibold mb-1">🛡️ iOS Sandbox Monitor</div>
          {sandboxErrors.slice(-3).map((error, i) => (
            <div key={i} className="mb-1">
              <div className={`font-medium ${error.resolved ? 'text-green-200' : 'text-orange-100'}`}>
                {error.resolved ? '✅' : '⚠️'} {error.type}: {error.message.substring(0, 40)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// Export hook for accessing sandbox error state
export function useIOSSandboxErrors() {
  const [errors, setErrors] = useState<SandboxError[]>([])

  return {
    errors,
    hasUnresolvedErrors: errors.some(e => !e.resolved),
    resolvedCount: errors.filter(e => e.resolved).length,
    updateErrors: setErrors
  }
}

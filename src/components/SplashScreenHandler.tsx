'use client'

import { useEffect, useState } from 'react'

export function SplashScreenHandler() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return

    // Enable debug mode for iOS apps and development
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSApp = (window as any).webkit?.messageHandlers
    const isCapacitor = (window as any).Capacitor
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isIOS || isIOSApp || isCapacitor || isDevelopment) {
      setShowDebug(true)
    }

    const addDebugInfo = (message: string) => {
      console.log(`🎬 SplashScreen: ${message}`)
      setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
    }

    addDebugInfo('Initializing splash screen handler...')
    addDebugInfo(`Environment: iOS=${isIOS}, IOSApp=${!!isIOSApp}, Capacitor=${!!isCapacitor}`)
    addDebugInfo(`User Agent: ${navigator.userAgent.substring(0, 60)}...`)

    const hideSplashScreen = async () => {
      try {
        addDebugInfo('Starting splash screen hiding process...')
        
        // Multi-strategy splash screen hiding to prevent undefined errors
        
        // Strategy 1: Modern ES module import (most reliable)
        const tryModernImport = async () => {
          try {
            addDebugInfo('Attempting modern import strategy...')
            const { SplashScreen } = await import('@capacitor/splash-screen')
            await SplashScreen.hide({ fadeOutDuration: 200 })
            addDebugInfo('✅ SplashScreen hidden via modern import')
            return true
          } catch (error) {
            addDebugInfo(`❌ Modern import failed: ${(error as Error).message}`)
            return false
          }
        }

        // Strategy 2: Wait for Capacitor with enhanced checking
        const waitForCapacitor = () => {
          return new Promise<boolean>((resolve) => {
            let attempts = 0
            const maxAttempts = 50 // 5 seconds max wait
            
            addDebugInfo('Waiting for Capacitor to load...')
            
            const checkCapacitor = () => {
              attempts++
              
              // Enhanced Capacitor availability check
              const capacitorAvailable = typeof (window as any).Capacitor !== 'undefined'
              const pluginsAvailable = (window as any).Capacitor?.Plugins
              const splashScreenAvailable = pluginsAvailable?.SplashScreen
              
              if (capacitorAvailable && pluginsAvailable && splashScreenAvailable) {
                // Additional validation - check if SplashScreen has the hide method
                if (typeof splashScreenAvailable.hide === 'function') {
                  addDebugInfo('✅ Capacitor SplashScreen plugin found and validated')
                  resolve(true)
                  return
                }
              }
              
              if (attempts >= maxAttempts) {
                addDebugInfo(`⏰ Capacitor timeout after ${attempts} attempts - using fallback methods`)
                resolve(false)
              } else {
                if (attempts % 10 === 0) {
                  addDebugInfo(`Waiting... attempt ${attempts}/${maxAttempts}`)
                }
                setTimeout(checkCapacitor, 100)
              }
            }
            checkCapacitor()
          })
        }

        // Strategy 3: Capacitor plugin with null/undefined guards
        const tryCapacitorPlugin = async () => {
          try {
            addDebugInfo('Attempting Capacitor plugin strategy...')
            const capacitor = (window as any).Capacitor
            if (!capacitor || !capacitor.Plugins) {
              throw new Error('Capacitor or Plugins not available')
            }

            const splashScreen = capacitor.Plugins.SplashScreen
            if (!splashScreen || typeof splashScreen.hide !== 'function') {
              throw new Error('SplashScreen plugin or hide method not available')
            }

            await splashScreen.hide({ fadeOutDuration: 200 })
            addDebugInfo('✅ SplashScreen hidden via Capacitor plugin')
            return true
          } catch (error) {
            addDebugInfo(`❌ Capacitor plugin failed: ${(error as Error).message}`)
            return false
          }
        }

        // Strategy 4: CSS-based fallback for web/PWA with enhanced detection
        const tryCSS = () => {
          try {
            addDebugInfo('Attempting CSS fallback strategy...')
            // Hide any splash screen elements via CSS
            const splashSelectors = [
              '[class*="splash"]',
              '[id*="splash"]',
              '.splash-screen',
              '#splash-screen',
              '.loading-screen',
              '#loading-screen',
              '.app-splash-screen', // Custom splash screen
              '#app-splash-screen'
            ]

            let hiddenElements = 0
            splashSelectors.forEach(selector => {
              const elements = document.querySelectorAll(selector)
              elements.forEach(el => {
                const htmlEl = el as HTMLElement
                htmlEl.style.transition = 'opacity 200ms ease-out'
                htmlEl.style.opacity = '0'
                setTimeout(() => {
                  htmlEl.style.display = 'none'
                }, 200)
                hiddenElements++
              })
            })

            if (hiddenElements > 0) {
              addDebugInfo(`✅ CSS fallback: Hidden ${hiddenElements} splash elements`)
              return true
            }
            
            addDebugInfo('ℹ️ No splash elements found for CSS fallback')
            return false
          } catch (error) {
            addDebugInfo(`❌ CSS fallback failed: ${(error as Error).message}`)
            return false
          }
        }

        // Execute strategies in order of preference
        let success = false

        // First try modern import
        success = await tryModernImport()
        
        if (!success) {
          // Wait for Capacitor and try plugin method
          const capacitorReady = await waitForCapacitor()
          if (capacitorReady) {
            success = await tryCapacitorPlugin()
          }
        }

        if (!success) {
          // Use CSS fallback
          success = tryCSS()
        }

        if (success) {
          addDebugInfo('✅ Splash screen successfully hidden')
        } else {
          addDebugInfo('❌ All splash screen hiding strategies failed')
        }

      } catch (error) {
        addDebugInfo(`❌ Global splash screen error: ${(error as Error).message}`)
        // Emergency CSS fallback
        try {
          const splashElements = document.querySelectorAll('[class*="splash"], [id*="splash"]')
          splashElements.forEach(el => {
            (el as HTMLElement).style.opacity = '0'
            setTimeout(() => {
              (el as HTMLElement).style.display = 'none'
            }, 200)
          })
          addDebugInfo('✅ Emergency CSS fallback applied')
        } catch (cssError) {
          addDebugInfo(`❌ Emergency CSS fallback also failed: ${(cssError as Error).message}`)
        }
      }
    }

    // Hide splash screen when DOM is ready with enhanced timing
    const initializeSplashHiding = () => {
      addDebugInfo('Initializing splash hiding timing...')
      
      // More conservative timing for iOS Capacitor to prevent React crashes
      const isCapacitor = !!(window as any).Capacitor
      const baseDelay = isCapacitor ? 500 : 100  // Longer delay for Capacitor
      
      if (document.readyState === 'complete') {
        addDebugInfo(`Document ready - hiding splash with ${baseDelay}ms delay for stability`)
        setTimeout(hideSplashScreen, baseDelay)
      } else if (document.readyState === 'interactive') {
        addDebugInfo(`DOM ready but resources loading - hiding with ${baseDelay + 200}ms delay`)
        setTimeout(hideSplashScreen, baseDelay + 200)
      } else {
        addDebugInfo('Document still loading - setting up event listeners')
        // Still loading - set up event listeners
        const handleLoad = () => {
          addDebugInfo(`Window load event fired - waiting ${baseDelay}ms for React stability`)
          setTimeout(hideSplashScreen, baseDelay)
          window.removeEventListener('load', handleLoad)
        }
        
        const handleDOMReady = () => {
          addDebugInfo(`DOM content loaded event fired - waiting ${baseDelay + 200}ms for React hydration`)
          setTimeout(hideSplashScreen, baseDelay + 200)
          document.removeEventListener('DOMContentLoaded', handleDOMReady)
        }
        
        window.addEventListener('load', handleLoad)
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', handleDOMReady)
        }
        
        return () => {
          window.removeEventListener('load', handleLoad)
          document.removeEventListener('DOMContentLoaded', handleDOMReady)
        }
      }
    }

    // Start initialization process
    return initializeSplashHiding()
  }, [])

  // Debug overlay component
  if (showDebug && debugInfo.length > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
        <div className="font-bold mb-2">🎬 Splash Debug</div>
        {debugInfo.map((info, index) => (
          <div key={index} className="mb-1">{info}</div>
        ))}
      </div>
    )
  }

  return null // This component doesn't render anything
}

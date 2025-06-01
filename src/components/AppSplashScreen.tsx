'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Logo component defined inline for this splash screen
function SplashScreenLogo() {
  return (
    <motion.div 
      className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl"
      initial={{ scale: 0.5, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.svg 
        className="w-16 h-16 sm:w-20 sm:h-20 text-white" 
        fill="currentColor" 
        viewBox="0 0 24 24"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </motion.svg>
    </motion.div>
  )
}

export function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  // Enhanced debugging for iOS
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const debugMessage = `${timestamp}: ${message}`
    console.log(`🎬 AppSplash: ${debugMessage}`)
    setDebugInfo(prev => [...prev.slice(-4), debugMessage])
  }

  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return

    // Enhanced iOS detection and debugging
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSApp = !!(window as any).webkit?.messageHandlers
    const isCapacitor = !!(window as any).Capacitor
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // Show debug for iOS, Capacitor, or development
    if (isIOS || isIOSApp || isCapacitor || isDevelopment) {
      setShowDebug(true)
    }

    addDebugInfo('🚀 AppSplashScreen initialized')
    addDebugInfo(`📱 iOS: ${isIOS}, App: ${isIOSApp}, Capacitor: ${isCapacitor}`)
    addDebugInfo(`🖥️ Standalone: ${isStandalone}, Dev: ${isDevelopment}`)
    addDebugInfo(`📊 Viewport: ${window.innerWidth}x${window.innerHeight}`)
    addDebugInfo(`🎨 Display mode: ${window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}`)

    // Start showing content after a brief delay
    const contentTimer = setTimeout(() => {
      addDebugInfo('✨ Showing content animations')
      setShowContent(true)
    }, 300)

    // Hide splash screen after app has loaded and animations complete
    // Extended time for iOS to ensure proper display
    const hideTimer = setTimeout(() => {
      addDebugInfo('⏰ Auto-hide timer triggered')
      setIsVisible(false)
    }, isIOS || isCapacitor ? 4000 : 3000) // 4 seconds for iOS/Capacitor, 3 for web

    // Also hide when the app is fully loaded (but not too quickly)
    const handleLoad = () => {
      addDebugInfo('📄 Window load event triggered')
      setTimeout(() => {
        addDebugInfo('🎬 Hiding splash via load event')
        setIsVisible(false)
      }, isIOS || isCapacitor ? 3000 : 2000) // Longer for iOS
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        addDebugInfo('👁️ App became visible')
      }
    }

    if (document.readyState === 'complete') {
      addDebugInfo('📄 Document already complete')
      setTimeout(() => {
        addDebugInfo('🎬 Hiding splash (document complete)')
        setIsVisible(false)
      }, isIOS || isCapacitor ? 3000 : 2000)
    } else {
      addDebugInfo(`📄 Document state: ${document.readyState}`)
      window.addEventListener('load', handleLoad)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Enhanced manual hide trigger for iOS testing
    const handleClick = () => {
      addDebugInfo('👆 Manual tap to hide')
      setIsVisible(false)
    }

    // Allow manual hide after 2 seconds
    const manualHideTimer = setTimeout(() => {
      if (isIOS || isCapacitor || isDevelopment) {
        addDebugInfo('🎯 Manual hide enabled (tap to dismiss)')
        document.addEventListener('click', handleClick, { once: true })
      }
    }, 2000)

    return () => {
      clearTimeout(contentTimer)
      clearTimeout(hideTimer)
      clearTimeout(manualHideTimer)
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  // Handle splash screen exit
  const handleExitComplete = () => {
    addDebugInfo('✅ Splash screen exit animation complete')
    // Remove from DOM completely
    const splashElement = document.getElementById('app-splash-screen')
    if (splashElement) {
      splashElement.remove()
    }
  }

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isVisible && (
          <motion.div 
            id="app-splash-screen" 
            className="app-splash-screen fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              // Ensure full coverage on iOS
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999
            }}
          >
            <div className="text-center text-white max-w-sm mx-auto px-6 relative">
              {/* App Logo with Animation */}
              <motion.div 
                className="mb-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={showContent ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <SplashScreenLogo />
              </motion.div>

              {/* App Name and Description with Staggered Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={showContent ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <h1 className="text-4xl font-bold mb-3 tracking-tight">
                  Coco Reader
                </h1>
                <p className="text-xl opacity-90 mb-2 font-medium">
                  Read Later App
                </p>
                <p className="text-sm opacity-75 mb-8">
                  v0.1.0 • Offline Reading • Local Storage
                </p>
              </motion.div>

              {/* Loading Animation */}
              <motion.div 
                className="flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={showContent ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.2
                  }}
                />
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.4
                  }}
                />
              </motion.div>

              {/* Device Info */}
              <motion.div 
                className="mt-8 text-xs opacity-60"
                initial={{ opacity: 0 }}
                animate={showContent ? { opacity: 0.6 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="flex items-center justify-center space-x-2 flex-wrap">
                  <span>🎬</span>
                  <span>Initializing App</span>
                  <span>•</span>
                  <span>
                    {typeof window !== 'undefined' ? 
                      ((window as any).Capacitor ? '📱 iOS App' : '🌐 PWA Mode') : 
                      '⏳ Loading...'
                    }
                  </span>
                </div>
                {showDebug && (
                  <div className="mt-2 text-xs opacity-40">
                    Tap to dismiss after 2 seconds
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Panel for iOS */}
      {showDebug && debugInfo.length > 0 && (
        <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-3 rounded-lg text-xs max-w-xs backdrop-blur-sm border border-white/20">
          <div className="font-bold mb-2 text-yellow-300">🎬 Splash Debug</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-gray-300">{info}</div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-400">
            iOS Splash Screen Test
          </div>
        </div>
      )}
    </>
  )
}

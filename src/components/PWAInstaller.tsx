'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // Check if already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (PWA installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInstallBannerDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
      
      if (isStandalone || isInWebAppiOS) {
        setIsInstalled(true)
        setShowInstallBanner(false)
      } else if (!isInstallBannerDismissed) {
        // Show banner after a short delay if not dismissed and not installed
        setTimeout(() => {
          setShowInstallBanner(true)
        }, 3000)
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Only show banner if not dismissed before
      const isInstallBannerDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
      if (!isInstallBannerDismissed) {
        setShowInstallBanner(true)
      }
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed') // Reset dismissal state
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    checkIfInstalled()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Manage body padding when banner is shown
  useEffect(() => {
    if (showInstallBanner) {
      document.body.classList.add('has-install-banner')
    } else {
      document.body.classList.remove('has-install-banner')
    }

    return () => {
      document.body.classList.remove('has-install-banner')
    }
  }, [showInstallBanner])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      // Show manual installation instructions
      alert('To install this app:\n\n' +
            'Chrome: Click menu (⋮) → "Install Coco Reader"\n' +
            'Safari: Click share (⬆) → "Add to Home Screen"\n' +
            'Edge: Click menu (⋯) → "Apps" → "Install this site as an app"')
      return
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user choice
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowInstallBanner(false)
        setIsInstalled(true)
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    
    // Auto-show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  if (isInstalled || !showInstallBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg pwa-install-banner">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">Install Coco Reader</h3>
            <p className="text-sm opacity-90">
              Get the full experience with offline reading and faster access. Install now!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 text-sm bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}

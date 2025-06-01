'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

interface AdvancedPWAFeaturesProps {
  enableOfflineCache?: boolean
  enableBackgroundSync?: boolean
  enablePushNotifications?: boolean
  enablePeriodicSync?: boolean
  maxCacheSize?: number // in MB
}

interface CacheStatus {
  size: number
  itemCount: number
  lastUpdated: number
  isOnline: boolean
  syncQueue: number
}

export default function AdvancedPWAFeatures({
  enableOfflineCache = true,
  enableBackgroundSync = true,
  enablePushNotifications = false,
  enablePeriodicSync = false,
  maxCacheSize = 50
}: AdvancedPWAFeaturesProps) {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    size: 0,
    itemCount: 0,
    lastUpdated: 0,
    isOnline: true, // Default to true for SSR
    syncQueue: 0
  })
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    initializePWAFeatures()
    const handlers = setupEventListeners()
    
    return () => {
      cleanup(handlers)
    }
  }, [])

  const initializePWAFeatures = async () => {
    try {
      // Check if app is installed
      if ('getInstalledRelatedApps' in navigator) {
        const relatedApps = await (navigator as any).getInstalledRelatedApps()
        setIsInstalled(relatedApps.length > 0)
      }

      // Initialize offline cache
      if (enableOfflineCache) {
        await initializeOfflineCache()
      }

      // Initialize background sync
      if (enableBackgroundSync && 'serviceWorker' in navigator) {
        await initializeBackgroundSync()
      }

      // Initialize push notifications
      if (enablePushNotifications && 'Notification' in window) {
        await initializePushNotifications()
      }

      // Initialize periodic sync
      if (enablePeriodicSync && 'serviceWorker' in navigator) {
        await initializePeriodicSync()
      }

      // Update cache status
      await updateCacheStatus()
    } catch (error) {
      console.warn('⚠️ PWA features initialization failed:', error)
    }
  }

  const initializeOfflineCache = async () => {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open('cocoa-reader-v1')
      
      // Cache essential resources
      const essentialResources = [
        '/',
        '/offline',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
      ]

      await cache.addAll(essentialResources)
      console.log('✅ Essential resources cached')
    } catch (error) {
      console.warn('⚠️ Failed to cache essential resources:', error)
    }
  }

  const initializeBackgroundSync = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Register background sync
      if ('sync' in registration) {
        await (registration as any).sync.register('article-sync')
        console.log('✅ Background sync registered')
      }
    } catch (error) {
      console.warn('⚠️ Background sync registration failed:', error)
    }
  }

  const initializePushNotifications = async () => {
    if (!('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('✅ Push notifications enabled')
      }
    } catch (error) {
      console.warn('⚠️ Push notifications setup failed:', error)
    }
  }

  const initializePeriodicSync = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Register periodic sync (experimental)
      if ('periodicSync' in registration) {
        await (registration as any).periodicSync.register('article-refresh', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        })
        console.log('✅ Periodic sync registered')
      }
    } catch (error) {
      console.warn('⚠️ Periodic sync registration failed:', error)
    }
  }

  const setupEventListeners = () => {
    // Online/offline status
    const handleOnlineStatus = () => {
      setCacheStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }))
    }

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // App installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Store references for cleanup
    return {
      handleOnlineStatus,
      handleBeforeInstallPrompt,
      handleAppInstalled
    }
  }

  const cleanup = (handlers?: {
    handleOnlineStatus: () => void,
    handleBeforeInstallPrompt: (e: Event) => void,
    handleAppInstalled: () => void
  }) => {
    if (handlers) {
      window.removeEventListener('online', handlers.handleOnlineStatus)
      window.removeEventListener('offline', handlers.handleOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handlers.handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handlers.handleAppInstalled)
    }
  }

  const updateCacheStatus = async () => {
    if (!('caches' in window)) return

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0
      let totalItems = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        totalItems += keys.length

        // Estimate cache size (rough calculation)
        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }

      setCacheStatus(prev => ({
        ...prev,
        size: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
        itemCount: totalItems,
        lastUpdated: Date.now()
      }))
    } catch (error) {
      console.warn('⚠️ Failed to update cache status:', error)
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ App installation accepted')
      } else {
        console.log('ℹ️ App installation declined')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.warn('⚠️ App installation failed:', error)
    }
  }

  const clearCache = async () => {
    if (!('caches' in window)) return

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      // Reinitialize cache
      await initializeOfflineCache()
      await updateCacheStatus()
      
      console.log('✅ Cache cleared and reinitialized')
    } catch (error) {
      console.warn('⚠️ Failed to clear cache:', error)
    }
  }

  const syncOfflineData = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      
      if ('sync' in registration) {
        await (registration as any).sync.register('manual-sync')
        console.log('✅ Manual sync triggered')
      }
    } catch (error) {
      console.warn('⚠️ Manual sync failed:', error)
    }
  }

  // Don't render UI in production unless explicitly needed
  if (process.env.NODE_ENV === 'production' && !Capacitor.isNativePlatform()) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 opacity-30 hover:opacity-100 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs max-w-xs">
        <div className="font-semibold mb-2 flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${cacheStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          PWA Status
        </div>
        
        <div className="space-y-1 text-gray-600 dark:text-gray-300">
          <div>Cache: {cacheStatus.size}MB ({cacheStatus.itemCount} items)</div>
          <div>Status: {cacheStatus.isOnline ? 'Online' : 'Offline'}</div>
          {cacheStatus.syncQueue > 0 && (
            <div className="text-yellow-600">Sync queue: {cacheStatus.syncQueue}</div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {deferredPrompt && !isInstalled && (
            <button
              onClick={installApp}
              className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Install App
            </button>
          )}
          
          {isInstalled && (
            <div className="text-green-600 text-xs">✅ App Installed</div>
          )}

          <div className="flex space-x-1">
            <button
              onClick={syncOfflineData}
              className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Sync
            </button>
            <button
              onClick={clearCache}
              className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
            <button
              onClick={updateCacheStatus}
              className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for PWA features
export function usePWAFeatures() {
  const [isOnline, setIsOnline] = useState(true) // Default to true for SSR
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Set initial online status after mount
    setIsOnline(navigator.onLine)
    
    const handleOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  return {
    isOnline,
    isInstalled,
    canInstall: typeof window !== 'undefined' && 'beforeinstallprompt' in window
  }
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function URLHandler() {
  const router = useRouter()

  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return

    const handleAppUrlOpen = async (event: any) => {
      console.log('App URL opened:', event)
      
      try {
        if (event.url) {
          const url = new URL(event.url)
          
          // Handle cocoa-reader:// scheme
          if (url.protocol === 'cocoa-reader:') {
            const params = new URLSearchParams(url.search)
            const sharedUrl = params.get('url')
            const title = params.get('title')
            const text = params.get('text')
            
            if (sharedUrl) {
              // Navigate to share page with parameters
              const shareUrl = `/share?url=${encodeURIComponent(sharedUrl)}&title=${encodeURIComponent(title || '')}&text=${encodeURIComponent(text || '')}`
              router.push(shareUrl)
            }
          }
          
          // Handle https:// scheme (when app is registered for https URLs)
          if (url.protocol === 'https:' || url.protocol === 'http:') {
            // Navigate to share page with the URL
            const shareUrl = `/share?url=${encodeURIComponent(event.url)}`
            router.push(shareUrl)
          }
        }
      } catch (error) {
        console.error('Error handling URL open:', error)
      }
    }

    // Check if running in Capacitor
    if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
      const { App } = (window as any).Capacitor.Plugins

      // Only add listener if App plugin is available
      if (App && App.addListener) {
        // Listen for URL open events
        App.addListener('appUrlOpen', handleAppUrlOpen)

        return () => {
          if (App.removeAllListeners) {
            App.removeAllListeners('appUrlOpen')
          }
        }
      }
    }

    // Check for PWA share target parameters on load
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const sharedUrl = urlParams.get('url')
      
      if (sharedUrl && window.location.pathname === '/share') {
        console.log('PWA share target detected:', sharedUrl)
        // Parameters already in URL, page will handle them
      }
    } catch (error) {
      console.error('Error checking PWA share target:', error)
    }

  }, [router])

  return null // This component doesn't render anything
}

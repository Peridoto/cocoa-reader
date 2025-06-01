'use client'

import { useEffect } from 'react'

/**
 * Temporary component to help trigger empty error object scenarios
 * This should be removed after debugging is complete
 */
export default function ErrorTriggerTest() {
  useEffect(() => {
    // Delay to let the app initialize
    const timer = setTimeout(() => {
      console.log('🧪 Error Trigger Test Starting...')
      
      // Test 1: Log an actual empty object
      console.error('Test error with empty object:', {})
      
      // Test 2: Try a cache-related error with empty object
      console.warn('Cache failed to load:', {}, 'additional context')
      
      // Test 3: Capacitor-style error
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        console.error('Capacitor plugin error:', {})
      }
      
      // Test 4: PWA registration error simulation
      console.error('Service worker registration failed:', {})
      
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="hidden">
      {/* This component is just for triggering test errors */}
    </div>
  )
}

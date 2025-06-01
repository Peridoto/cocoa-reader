'use client'

import { useEffect, useState } from 'react'

interface ErrorTrigger {
  name: string
  description: string
  action: () => void
}

export default function ErrorTriggerComponent() {
  const [isVisible, setIsVisible] = useState(false)
  const [triggeredErrors, setTriggeredErrors] = useState<string[]>([])

  const errorTriggers: ErrorTrigger[] = [
    {
      name: 'Empty Object Error',
      description: 'Trigger console.error with empty object',
      action: () => {
        console.error('Test error with empty object:', {})
        setTriggeredErrors(prev => [...prev, 'Empty Object Error'])
      }
    },
    {
      name: 'Cache Failure',
      description: 'Simulate cache failure with empty object',
      action: () => {
        console.warn('Cache failed to load:', {}, 'Additional context')
        setTriggeredErrors(prev => [...prev, 'Cache Failure'])
      }
    },
    {
      name: 'Capacitor Plugin Error',
      description: 'Simulate Capacitor plugin error',
      action: () => {
        const fakeError = new Error('Plugin failed')
        // Simulate error object losing properties
        const emptyError = JSON.parse(JSON.stringify({}))
        console.error('Capacitor plugin error:', emptyError, fakeError.message)
        setTriggeredErrors(prev => [...prev, 'Capacitor Plugin Error'])
      }
    },
    {
      name: 'PWA Update Error',
      description: 'Simulate PWA service worker error',
      action: () => {
        console.error('Service worker update failed:', {}, 'Registration failed')
        setTriggeredErrors(prev => [...prev, 'PWA Update Error'])
      }
    },
    {
      name: 'iOS Security Error',
      description: 'Simulate iOS security sandbox error',
      action: () => {
        try {
          // This might trigger security errors in iOS
          localStorage.setItem('test', JSON.stringify({}))
          console.error('iOS security violation:', {})
        } catch (error) {
          console.error('Security error caught:', {}, error)
        }
        setTriggeredErrors(prev => [...prev, 'iOS Security Error'])
      }
    },
    {
      name: 'Network Error Chain',
      description: 'Chain of errors that might lose properties',
      action: async () => {
        try {
          const response = await fetch('https://nonexistent-domain-12345.com')
          console.log(response)
        } catch (networkError) {
          const serializedError = JSON.parse(JSON.stringify(networkError))
          console.error('Network chain error:', serializedError, {})
          setTriggeredErrors(prev => [...prev, 'Network Error Chain'])
        }
      }
    },
    {
      name: 'Clear Triggers',
      description: 'Clear triggered error list',
      action: () => {
        setTriggeredErrors([])
      }
    }
  ]

  // Only show in development or when testing
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    const isTesting = window.location.search.includes('debug=true')
    setIsVisible(isDev || isTesting)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 bg-yellow-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-3">🧪 Error Trigger Tool</h3>
      
      <div className="space-y-2 mb-4">
        {errorTriggers.map((trigger, index) => (
          <button
            key={index}
            onClick={trigger.action}
            className="w-full text-left p-2 bg-yellow-800 hover:bg-yellow-700 rounded text-xs"
            title={trigger.description}
          >
            {trigger.name}
          </button>
        ))}
      </div>

      {triggeredErrors.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-800 rounded">
          <div className="text-xs font-semibold mb-1">Triggered ({triggeredErrors.length}):</div>
          <div className="text-xs text-gray-300">
            {triggeredErrors.slice(-3).map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-300">
        💡 Watch the EmptyErrorObjectDebugger panel (bottom-right) for analysis
      </div>
    </div>
  )
}

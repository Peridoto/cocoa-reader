'use client'

import React, { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { StatusBar, Style } from '@capacitor/status-bar'

interface IOSUIEnhancementsProps {
  children: React.ReactNode
  enableHaptics?: boolean
  enableStatusBarStyling?: boolean
  enableSafeAreaHandling?: boolean
}

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export default function IOSUIEnhancements({
  children,
  enableHaptics = true,
  enableStatusBarStyling = true,
  enableSafeAreaHandling = true
}: IOSUIEnhancementsProps) {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    const initializeIOSFeatures = async () => {
      try {
        // Configure safe area insets
        if (enableSafeAreaHandling) {
          // Use CSS environment variables as fallback for safe area
          try {
            // Try to get safe area from CSS environment variables
            const computedStyle = getComputedStyle(document.documentElement)
            const topInset = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0
            const bottomInset = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0
            const leftInset = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
            const rightInset = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
            
            setSafeAreaInsets({
              top: topInset,
              bottom: bottomInset,
              left: leftInset,
              right: rightInset
            })
          } catch (e) {
            console.log('Using default safe area insets')
          }
        }

        // Configure status bar
        if (enableStatusBarStyling) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDarkMode(prefersDark)
          
          await StatusBar.setStyle({ 
            style: prefersDark ? Style.Dark : Style.Light 
          })
          await StatusBar.setBackgroundColor({ 
            color: prefersDark ? '#000000' : '#ffffff' 
          })
        }

        // Set up haptic feedback for interactive elements
        if (enableHaptics) {
          setupHapticFeedback()
        }

        // Listen for theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleThemeChange = async (e: MediaQueryListEvent) => {
          setIsDarkMode(e.matches)
          if (enableStatusBarStyling) {
            await StatusBar.setStyle({ 
              style: e.matches ? Style.Dark : Style.Light 
            })
            await StatusBar.setBackgroundColor({ 
              color: e.matches ? '#000000' : '#ffffff' 
            })
          }
        }

        mediaQuery.addEventListener('change', handleThemeChange)

        return () => {
          mediaQuery.removeEventListener('change', handleThemeChange)
        }
      } catch (error) {
        console.warn('⚠️ iOS UI features initialization failed:', error)
      }
    }

    initializeIOSFeatures()
  }, [enableHaptics, enableStatusBarStyling, enableSafeAreaHandling])

  const setupHapticFeedback = () => {
    // Add haptic feedback to buttons
    const buttons = document.querySelectorAll('button, [role="button"]')
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        Haptics.impact({ style: ImpactStyle.Light })
      })
    })

    // Add haptic feedback to links
    const links = document.querySelectorAll('a[href]')
    links.forEach(link => {
      link.addEventListener('touchstart', () => {
        Haptics.impact({ style: ImpactStyle.Light })
      })
    })

    // Add haptic feedback to form controls
    const formControls = document.querySelectorAll('input, select, textarea')
    formControls.forEach(control => {
      control.addEventListener('focus', () => {
        Haptics.impact({ style: ImpactStyle.Light })
      })
    })
  }

  const provideFeedback = async (type: 'success' | 'warning' | 'error' | 'selection') => {
    if (!enableHaptics || !Capacitor.isNativePlatform()) return

    try {
      switch (type) {
        case 'success':
          await Haptics.impact({ style: ImpactStyle.Medium })
          break
        case 'warning':
          await Haptics.impact({ style: ImpactStyle.Heavy })
          break
        case 'error':
          await Haptics.impact({ style: ImpactStyle.Heavy })
          setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 100)
          break
        case 'selection':
          await Haptics.impact({ style: ImpactStyle.Light })
          break
      }
    } catch (error) {
      console.warn('⚠️ Haptic feedback failed:', error)
    }
  }

  const containerStyle = enableSafeAreaHandling ? {
    paddingTop: `${safeAreaInsets.top}px`,
    paddingBottom: `${safeAreaInsets.bottom}px`,
    paddingLeft: `${safeAreaInsets.left}px`,
    paddingRight: `${safeAreaInsets.right}px`,
  } : {}

  return (
    <div 
      className="ios-ui-container min-h-screen"
      style={containerStyle}
      data-ios-enhanced="true"
    >
      {/* iOS-specific styling */}
      <style jsx>{`
        .ios-ui-container {
          /* iOS momentum scrolling */
          -webkit-overflow-scrolling: touch;
          
          /* Smooth transitions */
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          
          /* Prevent zoom on input focus */
          touch-action: manipulation;
        }
        
        .ios-ui-container * {
          /* Prevent text selection on interactive elements */
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .ios-ui-container input,
        .ios-ui-container textarea,
        .ios-ui-container [contenteditable] {
          /* Allow text selection in input fields */
          -webkit-user-select: text;
          user-select: text;
        }
        
        .ios-ui-container button,
        .ios-ui-container [role="button"] {
          /* iOS button styling */
          -webkit-appearance: none;
          border-radius: 8px;
          transition: transform 0.1s ease-in-out, background-color 0.2s ease;
        }
        
        .ios-ui-container button:active,
        .ios-ui-container [role="button"]:active {
          transform: scale(0.96);
        }
        
        /* iOS-style scrollbars */
        .ios-ui-container ::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        
        .ios-ui-container ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .ios-ui-container ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .ios-ui-container ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Dark mode scrollbars */
        @media (prefers-color-scheme: dark) {
          .ios-ui-container ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .ios-ui-container ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
        
        /* iOS bounce effect */
        .ios-bounce {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Focus styles for accessibility */
        .ios-ui-container *:focus {
          outline: 2px solid #007AFF;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .ios-ui-container,
          .ios-ui-container * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
      
      {children}
      
      {/* Provide feedback function to child components */}
      <IOSFeedbackProvider onFeedback={provideFeedback} />
    </div>
  )
}

// Context provider for haptic feedback
interface IOSFeedbackContextType {
  provideFeedback: (type: 'success' | 'warning' | 'error' | 'selection') => Promise<void>
}

const IOSFeedbackContext = React.createContext<IOSFeedbackContextType | null>(null)

function IOSFeedbackProvider({ 
  children, 
  onFeedback 
}: { 
  children?: React.ReactNode
  onFeedback: (type: 'success' | 'warning' | 'error' | 'selection') => Promise<void>
}) {
  return (
    <IOSFeedbackContext.Provider value={{ provideFeedback: onFeedback }}>
      {children}
    </IOSFeedbackContext.Provider>
  )
}

// Hook for using iOS feedback in components
export function useIOSFeedback() {
  const context = React.useContext(IOSFeedbackContext)
  if (!context) {
    return {
      provideFeedback: async () => {} // No-op if not in iOS context
    }
  }
  return context
}

// Enhanced button component with iOS styling
export function IOSButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  feedbackType = 'selection',
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
  disabled?: boolean
  feedbackType?: 'success' | 'warning' | 'error' | 'selection'
  className?: string
  [key: string]: any
}) {
  const { provideFeedback } = useIOSFeedback()

  const handleClick = async () => {
    await provideFeedback(feedbackType)
    onClick?.()
  }

  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
  }
  const disabledClasses = 'opacity-50 cursor-not-allowed'

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

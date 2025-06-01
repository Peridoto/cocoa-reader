'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with system preference during SSR to prevent mismatch
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme
        const validTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system'
        
        // Determine resolved theme
        let newResolvedTheme: 'light' | 'dark'
        if (validTheme === 'system') {
          newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
          newResolvedTheme = validTheme
        }
        
        // Update state
        setTheme(validTheme)
        setResolvedTheme(newResolvedTheme)
        
        // Update DOM
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newResolvedTheme)
        
        setIsInitialized(true)
      } catch (error) {
        console.warn('Theme initialization failed:', error)
        setIsInitialized(true)
      }
    }

    initializeTheme()
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const updateTheme = () => {
      try {
        let newResolvedTheme: 'light' | 'dark'
        
        if (theme === 'system') {
          newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
          newResolvedTheme = theme
        }
        
        setResolvedTheme(newResolvedTheme)
        
        // Update DOM
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newResolvedTheme)
        
        // Save to localStorage
        localStorage.setItem('theme', theme)
      } catch (error) {
        console.warn('Theme update failed:', error)
      }
    }

    updateTheme()

    // Listen for system theme changes only if theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateTheme()
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, isInitialized])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

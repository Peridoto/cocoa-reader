'use client'

import { useState, useEffect } from 'react'

interface CoffeeDonationButtonProps {
  articlesCount: number
  onShake?: () => void
}

export function CoffeeDonationButton({ articlesCount, onShake }: CoffeeDonationButtonProps) {
  const [shouldShake, setShouldShake] = useState(false)
  const [lastShakeCount, setLastShakeCount] = useState(0)

  useEffect(() => {
    // Check if user has added 15 new articles since last shake
    const shakeThreshold = Math.floor(articlesCount / 15) * 15
    
    if (articlesCount > 0 && articlesCount >= shakeThreshold && shakeThreshold > lastShakeCount) {
      setShouldShake(true)
      setLastShakeCount(shakeThreshold)
      onShake?.()
      
      // Stop shaking after 3 seconds
      setTimeout(() => {
        setShouldShake(false)
      }, 3000)
    }
  }, [articlesCount, lastShakeCount, onShake])

  const handleClick = () => {
    window.open('https://buymeacoffee.com/peridoto', '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${shouldShake ? 'animate-shake' : ''}`}
      aria-label="Buy me a coffee"
      title="Buy me a coffee ☕"
    >
      {/* Coffee Cup Icon */}
      <svg 
        className="w-5 h-5" 
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M20 12a8 8 0 11-16 0V6a2 2 0 012-2h12a2 2 0 012 2v6zM6 8h12M8 21l8-4"
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 10a4 4 0 100 8"
        />
      </svg>
      
      {/* Shake indicator */}
      {shouldShake && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
      
      {/* Celebration particles when shaking */}
      {shouldShake && (
        <>
          <div className="absolute -top-2 -left-2 text-yellow-400 animate-bounce">✨</div>
          <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce delay-75">✨</div>
          <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce delay-150">✨</div>
          <div className="absolute -bottom-2 -right-2 text-yellow-400 animate-bounce delay-300">✨</div>
        </>
      )}
    </button>
  )
}

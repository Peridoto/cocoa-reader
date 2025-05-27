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
      className={`
        relative p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 
        transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg
        ${shouldShake ? 'animate-shake' : ''}
      `}
      title="Buy me a coffee ☕"
    >
      {/* Coffee Icon */}
      <svg 
        className="w-6 h-6" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M2 21h16c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H2v6zm13.5-9.5c0-.83-.67-1.5-1.5-1.5H4c-.83 0-1.5.67-1.5 1.5S3.17 13 4 13h10c.83 0 1.5-.67 1.5-1.5zM2 5v4h16V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z"/>
        <path d="M20 8h-2v4h2c1.1 0 2-.9 2-2s-.9-2-2-2z"/>
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

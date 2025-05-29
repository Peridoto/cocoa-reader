'use client'

import { Suspense, useState, useEffect } from 'react'
import HomePageContent from './HomePageContent'
import { WelcomePage } from '../components/WelcomePage'

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('cocoa-reader-visited')
    setShowWelcome(!hasVisited)
  }, [])

  const handleWelcomeComplete = () => {
    // Mark as visited and hide welcome page
    localStorage.setItem('cocoa-reader-visited', 'true')
    setShowWelcome(false)
  }

  // Show loading spinner while determining if we should show welcome
  if (showWelcome === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      </div>
    )
  }

  // Show welcome page for first-time visitors
  if (showWelcome) {
    return <WelcomePage onComplete={handleWelcomeComplete} />
  }

  // Show main app for returning visitors
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}

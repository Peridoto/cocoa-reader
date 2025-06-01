import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { WelcomePage } from '@/components/WelcomePage'
import HomePageContent from '@/components/HomePageContent'
import { URLHandler } from '@/components/URLHandler'
import HydrationErrorBoundary from '@/components/React18CompatibilityWrapper'

export default function Home() {
  const router = useRouter()
  const [isWelcomeCompleted, setIsWelcomeCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    // Ensure router is ready
    if (!router.isReady) return
    
    // Check if welcome was completed
    const welcomeCompleted = localStorage.getItem('welcomeCompleted') === 'true'
    setIsWelcomeCompleted(welcomeCompleted)
  }, [router.isReady])

  const handleWelcomeComplete = () => {
    localStorage.setItem('welcomeCompleted', 'true')
    setIsWelcomeCompleted(true)
  }

  // Loading state while checking localStorage
  if (isWelcomeCompleted === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return isWelcomeCompleted ? (
    <HydrationErrorBoundary>
      <URLHandler />
      <HomePageContent />
    </HydrationErrorBoundary>
  ) : (
    <WelcomePage onComplete={handleWelcomeComplete} />
  )
}

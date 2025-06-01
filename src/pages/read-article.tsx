import { useRouter } from 'next/router'
import { useEffect } from 'react'
import ReadingPageClient from '@/components/ReadingPageClient'

export default function ReadArticlePage() {
  const router = useRouter()

  // Ensure we're ready for client-side rendering
  useEffect(() => {
    // This ensures the router is ready before rendering content that depends on query params
    if (!router.isReady) return
  }, [router.isReady])

  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍫</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <ReadingPageClient />
}

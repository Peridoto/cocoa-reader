'use client'

import { Suspense } from 'react'
import HomePageContent from './HomePageContent'

export default function HomePage() {
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

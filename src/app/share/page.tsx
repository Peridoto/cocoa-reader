'use client'

import { Suspense } from 'react'
import SharePageContentProduction from './SharePageContentProduction'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing to save your article...
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Add Article
        </h1>
        <Suspense fallback={<LoadingFallback />}>
          <SharePageContentProduction />
        </Suspense>
      </div>
    </div>
  )
}

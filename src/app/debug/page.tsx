'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DebugParams() {
  const searchParams = useSearchParams()
  
  const allParams = Object.fromEntries(searchParams.entries())
  const url = searchParams.get('url')
  const title = searchParams.get('title')
  const text = searchParams.get('text')
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug URL Parameters</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Individual Parameters</h2>
          <div className="space-y-2">
            <div><strong>URL:</strong> {url || 'Not found'}</div>
            <div><strong>Title:</strong> {title || 'Not found'}</div>
            <div><strong>Text:</strong> {text || 'Not found'}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">All Parameters</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(allParams, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Raw Search String</h2>
          <div className="bg-gray-100 p-4 rounded text-sm">
            {typeof window !== 'undefined' ? window.location.search : 'Server-side render'}
          </div>
        </div>
        
        <div className="mt-6">
          <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebugParams />
    </Suspense>
  )
}

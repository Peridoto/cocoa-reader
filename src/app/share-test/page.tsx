'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function SimpleShareTest() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }
  
  useEffect(() => {
    addLog('SimpleShareTest component mounted')
    
    const url = searchParams.get('url')
    const title = searchParams.get('title')
    const text = searchParams.get('text')
    
    addLog(`URL parameter: ${url}`)
    addLog(`Title parameter: ${title}`)
    addLog(`Text parameter: ${text}`)
    
    if (url) {
      addLog('URL found - would start processing')
      
      // Simulate the processing that would happen
      setTimeout(() => {
        addLog('Simulated processing complete')
      }, 1000)
    } else {
      addLog('No URL found - showing no article message')
    }
  }, [searchParams])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Share Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Parameters Received</h2>
          <div className="space-y-2">
            <div><strong>URL:</strong> {searchParams.get('url') || 'None'}</div>
            <div><strong>Title:</strong> {searchParams.get('title') || 'None'}</div>
            <div><strong>Text:</strong> {searchParams.get('text') || 'None'}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Console Logs</h2>
          <div className="bg-gray-100 p-4 rounded text-sm max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
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

export default function ShareTestPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading share test...</div>}>
      <SimpleShareTest />
    </Suspense>
  )
}

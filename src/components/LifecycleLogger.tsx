'use client'

import { useEffect, useRef } from 'react'

interface LifecycleLoggerProps {
  componentName: string
  logLevel?: 'minimal' | 'detailed'
}

export default function LifecycleLogger({ 
  componentName, 
  logLevel = 'minimal' 
}: LifecycleLoggerProps) {
  const mountTime = useRef(Date.now())
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current++
    const timeString = new Date().toLocaleTimeString()
    
    if (logLevel === 'detailed') {
      console.log(`🔄 [${timeString}] ${componentName} - MOUNT/UPDATE #${renderCount.current}`, {
        mountTime: mountTime.current,
        timeSinceMount: Date.now() - mountTime.current,
        documentState: document.readyState,
        bodyChildren: document.body?.children.length || 0,
        location: window.location.href,
        isCapacitor: !!(window as any).Capacitor,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      })
    } else {
      console.log(`🔄 [${timeString}] ${componentName} - MOUNT/UPDATE #${renderCount.current}`)
    }

    return () => {
      const unmountTime = new Date().toLocaleTimeString()
      const lifetime = Date.now() - mountTime.current
      
      if (logLevel === 'detailed') {
        console.log(`🔄 [${unmountTime}] ${componentName} - UNMOUNT`, {
          lifetime: `${lifetime}ms`,
          finalRenderCount: renderCount.current,
          documentState: document.readyState
        })
      } else {
        console.log(`🔄 [${unmountTime}] ${componentName} - UNMOUNT (lived ${lifetime}ms)`)
      }
    }
  })

  return null
}

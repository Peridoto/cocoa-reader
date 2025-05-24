import { Article } from '@/types/article'

export interface ExportData {
  version: string
  exportDate: string
  totalArticles: number
  articles: Article[]
  metadata: {
    appName: string
    appVersion: string
    userAgent?: string
  }
}

/**
 * Export articles to JSON format
 */
export function exportArticlesToJSON(articles: Article[]): string {
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalArticles: articles.length,
    articles: articles,
    metadata: {
      appName: 'Cocoa Reader',
      appVersion: '0.1.0',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    }
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Parse imported JSON data and validate it
 */
export function parseImportData(jsonString: string): ExportData {
  try {
    const data = JSON.parse(jsonString)
    
    // Basic validation
    if (!data.version || !data.articles || !Array.isArray(data.articles)) {
      throw new Error('Invalid export file format')
    }
    
    // Validate each article has required fields
    data.articles.forEach((article: any, index: number) => {
      if (!article.url || !article.title || !article.domain) {
        throw new Error(`Invalid article data at index ${index}`)
      }
    })
    
    return data as ExportData
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
  if (typeof window === 'undefined') return
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename for export
 */
export function generateExportFilename(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '') // HHMM
  return `cocoa-reader-export-${dateStr}-${timeStr}.json`
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsText(file)
  })
}

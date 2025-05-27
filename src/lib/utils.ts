/**
 * Format a date to show relative time (e.g., "2 hours ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`
  
  return date.toLocaleDateString()
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Debounce a function to limit how often it can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Calculate reading progress based on scroll position
 */
export function calculateReadingProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  if (scrollHeight <= clientHeight) return 100
  
  const scrollableHeight = scrollHeight - clientHeight
  const progress = (scrollTop / scrollableHeight) * 100
  
  return clamp(Math.round(progress), 0, 100)
}

/**
 * Normalize URL by adding https:// prefix if no protocol is provided
 */
export function normalizeUrl(url: string): string {
  const trimmedUrl = url.trim()
  
  // Return empty string if input is empty
  if (!trimmedUrl) return ''
  
  // If URL already has a protocol, return as is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }
  
  // If URL starts with //, add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`
  }
  
  // Otherwise, add https:// prefix
  return `https://${trimmedUrl}`
}

/**
 * Extract a meaningful title from a URL for fallback articles
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const domain = urlObj.hostname
    
    // Special handling for GitHub
    if (domain.includes('github.com')) {
      const pathParts = pathname.split('/').filter(p => p)
      if (pathParts.length >= 2) {
        const owner = pathParts[0]
        const repo = pathParts[1]
        
        if (pathParts.includes('blob') && pathParts.length > 4) {
          // It's a file
          const fileName = pathParts[pathParts.length - 1]
          return `${fileName} - ${owner}/${repo}`
        } else if (pathParts.includes('issues') && pathParts.length > 3) {
          return `Issue #${pathParts[3]} - ${owner}/${repo}`
        } else if (pathParts.includes('pull') && pathParts.length > 3) {
          return `Pull Request #${pathParts[3]} - ${owner}/${repo}`
        } else if (pathParts.length === 2) {
          return `${owner}/${repo}`
        } else if (pathParts.length > 2) {
          return `${pathParts.slice(2).join('/')} - ${owner}/${repo}`
        }
      }
    }
    
    // Extract meaningful part from path
    const pathParts = pathname.split('/').filter(p => p && p !== 'index.html' && p !== 'index.php')
    
    if (pathParts.length > 0) {
      // Use the last meaningful part of the path
      const lastPart = pathParts[pathParts.length - 1]
      
      // Remove common file extensions
      const cleanPart = lastPart
        .replace(/\.(html|htm|php|asp|aspx|jsp)$/i, '')
        .replace(/\.[^/.]+$/, '') // Remove any remaining extension
      
      if (cleanPart && cleanPart.length > 1) {
        // Convert URL slug to readable title
        const title = cleanPart
          .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
          .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
          .trim()
        
        if (title.length > 3) {
          return title
        }
      }
    }
    
    // Fallback to domain-based title
    const domainParts = domain.split('.')
    const mainDomain = domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0]
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1) + ' Article'
  } catch {
    return 'Saved Article'
  }
}

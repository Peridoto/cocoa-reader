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
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`
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

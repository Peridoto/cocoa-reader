/**
 * Web Ethics Compliance Module
 * Ensures responsible web scraping by respecting robots.txt, meta tags, and HTTP headers
 */

export interface RobotsRule {
  userAgent: string
  disallowed: string[]
  allowed: string[]
  crawlDelay?: number
  sitemaps: string[]
}

export interface ScrapingPermissions {
  allowed: boolean
  reason: string
  crawlDelay?: number
  respectHeaders: {
    noarchive: boolean
    noindex: boolean
    nofollow: boolean
  }
}

/**
 * Parse robots.txt content
 */
export function parseRobotsTxt(robotsTxt: string): RobotsRule[] {
  const rules: RobotsRule[] = []
  const lines = robotsTxt.split('\n').map(line => line.trim())
  
  let currentRule: Partial<RobotsRule> = { sitemaps: [] }
  
  for (const line of lines) {
    if (line.startsWith('#') || !line) continue
    
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim()
    
    switch (key.toLowerCase()) {
      case 'user-agent':
        if (currentRule.userAgent) {
          rules.push(currentRule as RobotsRule)
          currentRule = { sitemaps: [] }
        }
        currentRule.userAgent = value
        currentRule.disallowed = []
        currentRule.allowed = []
        break
      
      case 'disallow':
        if (currentRule.disallowed) {
          currentRule.disallowed.push(value)
        }
        break
      
      case 'allow':
        if (currentRule.allowed) {
          currentRule.allowed.push(value)
        }
        break
      
      case 'crawl-delay':
        currentRule.crawlDelay = parseInt(value, 10)
        break
      
      case 'sitemap':
        currentRule.sitemaps?.push(value)
        break
    }
  }
  
  if (currentRule.userAgent) {
    rules.push(currentRule as RobotsRule)
  }
  
  return rules
}

/**
 * Check if a URL path is allowed by robots.txt rules
 */
export function isPathAllowed(path: string, rules: RobotsRule[]): boolean {
  const userAgents = ['*', 'readlaterbot', 'cocoa-reader']
  
  for (const userAgent of userAgents) {
    const rule = rules.find(r => 
      r.userAgent.toLowerCase() === userAgent || 
      r.userAgent === '*'
    )
    
    if (!rule) continue
    
    // Check explicit allows first
    for (const allow of rule.allowed) {
      if (allow && pathMatches(path, allow)) {
        return true
      }
    }
    
    // Check disallows
    for (const disallow of rule.disallowed) {
      if (disallow && pathMatches(path, disallow)) {
        return false
      }
    }
  }
  
  return true // Default to allowed if no specific rule found
}

/**
 * Check if a path matches a robots.txt pattern
 */
function pathMatches(path: string, pattern: string): boolean {
  if (pattern === '/') return true
  if (pattern === '') return false
  
  // Convert robots.txt pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\$/g, '$')
  
  const regex = new RegExp(`^${regexPattern}`)
  return regex.test(path)
}

/**
 * Parse meta tags and HTTP headers for scraping permissions
 */
export function parseMetaAndHeaders(
  document: Document, 
  headers: Headers
): ScrapingPermissions['respectHeaders'] {
  const metaRobots = document.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() || ''
  const metaGoogleBot = document.querySelector('meta[name="googlebot"]')?.getAttribute('content')?.toLowerCase() || ''
  
  const xRobotsTag = headers.get('x-robots-tag')?.toLowerCase() || ''
  
  const allDirectives = `${metaRobots} ${metaGoogleBot} ${xRobotsTag}`.toLowerCase()
  
  return {
    noarchive: allDirectives.includes('noarchive'),
    noindex: allDirectives.includes('noindex'),
    nofollow: allDirectives.includes('nofollow')
  }
}

/**
 * Check if scraping is allowed for a given URL
 */
export async function checkScrapingPermissions(url: string): Promise<ScrapingPermissions> {
  try {
    const urlObj = new URL(url)
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`
    
    // Fetch robots.txt
    let robotsRules: RobotsRule[] = []
    let crawlDelay: number | undefined
    
    try {
      const robotsResponse = await fetch(robotsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0; +https://github.com/cocoa-reader)'
        }
      })
      
      if (robotsResponse.ok) {
        const robotsTxt = await robotsResponse.text()
        robotsRules = parseRobotsTxt(robotsTxt)
        
        // Find crawl delay for our user agent
        const relevantRule = robotsRules.find(rule => 
          rule.userAgent === '*' || 
          rule.userAgent.toLowerCase().includes('cocoa') ||
          rule.userAgent.toLowerCase().includes('readlater')
        )
        crawlDelay = relevantRule?.crawlDelay
      }
    } catch (error) {
      console.warn('Could not fetch robots.txt:', error)
      // Continue without robots.txt if it's not accessible
    }
    
    // Check if path is allowed
    const pathAllowed = isPathAllowed(urlObj.pathname, robotsRules)
    
    if (!pathAllowed) {
      return {
        allowed: false,
        reason: 'URL is disallowed by robots.txt',
        crawlDelay,
        respectHeaders: { noarchive: false, noindex: false, nofollow: false }
      }
    }
    
    // Check the actual page for meta tags and headers
    try {
      const pageResponse = await fetch(url, {
        method: 'HEAD', // Use HEAD to check headers without downloading content
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0; +https://github.com/cocoa-reader)'
        }
      })
      
      if (pageResponse.ok) {
        const xRobotsTag = pageResponse.headers.get('x-robots-tag')?.toLowerCase() || ''
        
        if (xRobotsTag.includes('noarchive')) {
          return {
            allowed: false,
            reason: 'Page has noarchive directive in X-Robots-Tag header',
            crawlDelay,
            respectHeaders: { noarchive: true, noindex: false, nofollow: false }
          }
        }
      }
    } catch (error) {
      console.warn('Could not check page headers:', error)
    }
    
    return {
      allowed: true,
      reason: 'Scraping is allowed',
      crawlDelay,
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    }
    
  } catch (error) {
    return {
      allowed: false,
      reason: `Error checking permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    }
  }
}

/**
 * Apply crawl delay if specified
 */
export async function applyCrawlDelay(delay?: number): Promise<void> {
  if (delay && delay > 0) {
    console.log(`Applying crawl delay of ${delay} seconds...`)
    await new Promise(resolve => setTimeout(resolve, delay * 1000))
  }
}

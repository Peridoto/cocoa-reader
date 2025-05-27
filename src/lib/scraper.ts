import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { 
  checkScrapingPermissions, 
  applyCrawlDelay, 
  parseMetaAndHeaders,
  type ScrapingPermissions 
} from './web-ethics'
import { extractTitleFromUrl } from './utils'

export interface ScrapedContent {
  title: string
  domain: string
  excerpt: string | null
  cleanedHTML: string
  textContent: string
}

export interface ScrapingResult extends ScrapedContent {
  ethicsCompliant: boolean
  permissions: ScrapingPermissions
}

/**
 * Create a fallback article when scraping fails due to access restrictions
 */
function createFallbackArticle(url: string, error: Error): ScrapingResult {
  const domain = new URL(url).hostname
  const title = extractTitleFromUrl(url)
  
  // Create helpful fallback content
  const fallbackContent = `
    <article class="fallback-article">
      <header>
        <h1>${title}</h1>
        <p class="domain-info">From: ${domain}</p>
      </header>
      
      <div class="content">
        <p>This article could not be automatically processed due to access restrictions, but the link has been saved for you to read later.</p>
        
        <div class="access-info">
          <h3>Why couldn't this be processed?</h3>
          <p>The website may have:</p>
          <ul>
            <li>Anti-scraping protection</li>
            <li>Login requirements</li>
            <li>Geographic restrictions</li>
            <li>Technical limitations</li>
          </ul>
        </div>
        
        <div class="reading-instructions">
          <h3>How to read this article:</h3>
          <p>Click the original link below to read the full content on the website:</p>
          <p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
        </div>
      </div>
    </article>
  `
  
  const textContent = `${title}

This article from ${domain} could not be automatically processed due to access restrictions, but the link has been saved for you to read later.

Why couldn't this be processed?
The website may have anti-scraping protection, login requirements, geographic restrictions, or technical limitations.

How to read this article:
Click the original link to read the full content: ${url}`

  // Create mock permissions for fallback
  const fallbackPermissions: ScrapingPermissions = {
    allowed: false,
    reason: 'Fallback article created due to access restrictions',
    respectHeaders: { noarchive: false, noindex: false, nofollow: false }
  }

  return {
    title,
    domain,
    excerpt: `Article from ${domain} saved for later reading. Content extraction was limited due to access restrictions.`,
    cleanedHTML: fallbackContent,
    textContent,
    ethicsCompliant: true, // Fallback respects access restrictions
    permissions: fallbackPermissions
  }
}

/**
 * Check if an error indicates access restrictions that should trigger fallback
 */
function isAccessDeniedError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  
  // HTTP error codes that typically indicate access restrictions
  // Note: 404 is NOT included as it means the page doesn't exist
  const accessDeniedPatterns = [
    'http error! status: 403', // Forbidden
    'http error! status: 401', // Unauthorized  
    'http error! status: 429', // Too Many Requests
    'http error! status: 503', // Service Unavailable
    'http error! status: 502', // Bad Gateway (often used for blocking)
    'access denied',
    'forbidden',
    'unauthorized',
    'blocked',
    'rate limit',
    'too many requests',
    'scraping not permitted',
    'disallowed by robots.txt',
    'page contains noarchive directive'
  ]
  
  return accessDeniedPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Scrapes and cleans content from a given URL using Mozilla Readability
 * with full respect for web ethics (robots.txt, meta tags, headers)
 * @param url The URL to scrape
 * @returns Promise<ScrapingResult> The cleaned content with ethics compliance info
 */
export async function scrapeArticle(url: string): Promise<ScrapingResult> {
  try {
    console.log('Starting ethical scrape for URL:', url)
    
    // Step 1: Check scraping permissions
    const permissions = await checkScrapingPermissions(url)
    
    if (!permissions.allowed) {
      console.log('Scraping not allowed:', permissions.reason)
      throw new Error(`Scraping not permitted: ${permissions.reason}`)
    }
    
    console.log('Scraping permissions granted:', permissions.reason)
    
    // Step 2: Apply crawl delay if specified
    if (permissions.crawlDelay) {
      await applyCrawlDelay(permissions.crawlDelay)
    }
    
    // Step 3: Fetch the webpage with proper user agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0; +https://github.com/cocoa-reader)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1', // Do Not Track
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    
    console.log('Fetch response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML length:', html.length)
    
    // Step 4: Parse with JSDOM and check for additional meta directives
    const dom = new JSDOM(html, { url })
    const document = dom.window.document
    
    // Check for page-level ethics compliance
    const pageEthics = parseMetaAndHeaders(document, response.headers)
    
    if (pageEthics.noarchive) {
      console.log('Page has noarchive directive - respecting this directive')
      throw new Error('Page contains noarchive directive - scraping not permitted')
    }
    
    // Extract domain
    const domain = new URL(url).hostname
    console.log('Extracted domain:', domain)
    
    // Step 5: Use Readability to extract clean content
    const reader = new Readability(document)
    const article = reader.parse()
    
    if (!article) {
      throw new Error('Could not parse article content')
    }
    
    console.log('Article parsed successfully with ethics compliance:', {
      title: article.title,
      contentLength: article.content.length,
      ethicsCompliant: true
    })
    
    return {
      title: article.title || 'Untitled Article',
      domain,
      excerpt: article.excerpt || null,
      cleanedHTML: article.content,
      textContent: article.textContent || '',
      ethicsCompliant: true,
      permissions
    }
  } catch (error) {
    console.error('Error in ethical scraping:', error)
    
    // Check if the error is due to access restrictions
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    
    if (isAccessDeniedError(errorInstance)) {
      console.log('Access denied error detected, creating fallback article:', errorInstance.message)
      return createFallbackArticle(url, errorInstance)
    }
    
    throw new Error(`Failed to scrape article ethically: ${errorInstance.message}`)
  }
}

import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { 
  checkScrapingPermissions, 
  applyCrawlDelay, 
  parseMetaAndHeaders,
  type ScrapingPermissions 
} from './web-ethics'

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
    throw new Error(`Failed to scrape article ethically: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

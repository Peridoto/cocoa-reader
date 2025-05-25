import { Article } from '@/types/article'

// Client-side article scraper using CORS proxy
export class ClientScraper {
  private corsProxies = [
    // More reliable CORS proxies
    'https://api.allorigins.win/get?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-proxy.htmldriven.com/?url=',
    'https://crossorigin.me/',
    'https://cors.eu.org/',
    // Backup options
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
  ]

  async scrapeArticle(url: string): Promise<Partial<Article>> {
    // Normalize URL
    const normalizedUrl = this.normalizeUrl(url)
    
    let htmlContent = ''
    let lastError: Error | null = null

    // Try different CORS proxies
    for (let i = 0; i < this.corsProxies.length; i++) {
      const proxy = this.corsProxies[i]
      console.log(`Trying proxy ${i + 1}/${this.corsProxies.length}: ${proxy}`)
      
      try {
        const proxyUrl = proxy + encodeURIComponent(normalizedUrl)
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0)',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (response.ok) {
          const data = await response.text()
          
          // Handle different proxy response formats
          if (proxy.includes('allorigins')) {
            try {
              const jsonData = JSON.parse(data)
              htmlContent = jsonData.contents
            } catch (parseError) {
              console.warn('Failed to parse allorigins response:', parseError)
              continue
            }
          } else {
            htmlContent = data
          }
          
          if (htmlContent && htmlContent.length > 100) {
            console.log(`Success with proxy: ${proxy}`)
            break
          }
        } else {
          console.warn(`Proxy ${proxy} returned status ${response.status}`)
        }
      } catch (err) {
        lastError = err as Error
        console.warn(`Proxy ${proxy} failed:`, err instanceof Error ? err.message : err)
        continue
      }
    }

    if (!htmlContent) {
      // Fallback: create a basic article with the URL
      console.warn('All proxies failed, creating basic article entry')
      return {
        url: normalizedUrl,
        title: this.extractTitleFromUrl(normalizedUrl),
        domain: new URL(normalizedUrl).hostname,
        excerpt: 'Article content could not be fetched. Click to visit the original URL.',
        cleanedHTML: `<p>Unable to fetch content from <a href="${normalizedUrl}" target="_blank">${normalizedUrl}</a></p>`,
        textContent: 'Content not available',
        readingTime: 1
      }
    }

    // Parse HTML and extract content
    return this.extractArticleContent(htmlContent, normalizedUrl)
  }

  private normalizeUrl(url: string): string {
    // Add https:// if no protocol
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url
    }
    return url
  }

  private extractArticleContent(html: string, url: string): Partial<Article> {
    // Create a DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract basic metadata
    const title = this.extractTitle(doc)
    const domain = new URL(url).hostname
    const textContent = this.extractTextContent(doc)
    const cleanedHTML = this.extractCleanedHTML(doc)
    const excerpt = this.generateExcerpt(textContent)
    const readingTime = this.calculateReadingTime(textContent)

    return {
      id: crypto.randomUUID(),
      title,
      url,
      domain,
      excerpt,
      cleanedHTML,
      textContent,
      read: false,
      createdAt: new Date(),
      scroll: 0,
      readingTime,
      summary: '',
      keyPoints: '',
      sentiment: 'neutral'
    }
  }

  private extractTitle(doc: Document): string {
    // Try different title sources in order of preference
    const sources = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'h1',
      'title'
    ]

    for (const selector of sources) {
      const element = doc.querySelector(selector)
      if (element) {
        const title = element.getAttribute('content') || element.textContent
        if (title && title.trim()) {
          return title.trim()
        }
      }
    }

    return 'Untitled Article'
  }

  private extractTextContent(doc: Document): string {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.sidebar', '.menu', '.navigation', '.comments',
      '.ads', '.advertisement', '.social-share'
    ]

    const clone = doc.cloneNode(true) as Document
    unwantedSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })

    // Try to find main content area
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '[role="main"]'
    ]

    for (const selector of contentSelectors) {
      const contentElement = clone.querySelector(selector)
      if (contentElement && contentElement.textContent && contentElement.textContent.trim().length > 100) {
        return contentElement.textContent.trim()
      }
    }

    // Fallback to body content
    const body = clone.querySelector('body')
    return body ? body.textContent?.trim() || '' : ''
  }

  private extractCleanedHTML(doc: Document): string {
    // Similar to text extraction but preserve HTML structure
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer',
      '.sidebar', '.menu', '.navigation', '.comments',
      '.ads', '.advertisement', '.social-share'
    ]

    const clone = doc.cloneNode(true) as Document
    unwantedSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })

    // Try to find main content area
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '[role="main"]'
    ]

    for (const selector of contentSelectors) {
      const contentElement = clone.querySelector(selector)
      if (contentElement && contentElement.innerHTML && contentElement.innerHTML.trim().length > 100) {
        return this.sanitizeHTML(contentElement.innerHTML)
      }
    }

    // Fallback to body content
    const body = clone.querySelector('body')
    return body ? this.sanitizeHTML(body.innerHTML) : ''
  }

  private sanitizeHTML(html: string): string {
    // Basic HTML sanitization - remove dangerous elements
    const dangerousElements = ['script', 'object', 'embed', 'form', 'input', 'button']
    let sanitized = html

    dangerousElements.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis')
      sanitized = sanitized.replace(regex, '')
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gis')
      sanitized = sanitized.replace(selfClosingRegex, '')
    })

    return sanitized
  }

  private generateExcerpt(textContent: string, maxLength: number = 200): string {
    if (!textContent) return ''
    
    const sentences = textContent.split(/[.!?]+/)
    let excerpt = ''
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      if (excerpt.length + trimmed.length > maxLength) {
        break
      }
      excerpt += trimmed + '. '
    }
    
    return excerpt.trim() || textContent.substring(0, maxLength) + '...'
  }

  private calculateReadingTime(textContent: string): number {
    const wordsPerMinute = 200
    const words = textContent.split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // Remove file extension and convert to readable title
      const filename = pathname.split('/').pop() || urlObj.hostname
      const title = filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
        .trim()
      
      return title || urlObj.hostname
    } catch {
      return url
    }
  }
}

export const clientScraper = new ClientScraper()

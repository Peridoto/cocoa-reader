import { Article } from '@/types/article'

// Client-side article scraper using CORS proxy
export class ClientScraper {
  private corsProxies = [
    // Most reliable iOS-compatible CORS proxies
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
    // Additional iOS-friendly proxies
    'https://cors-proxy.htmldriven.com/?url=',
    'https://crossorigin.me/',
    'https://cors.eu.org/',
    // Backup options
    'https://cors-anywhere.herokuapp.com/',
  ]

  private isIOSPWA(): boolean {
    const userAgent = navigator.userAgent || ''
    const standalone = (window.navigator as any).standalone
    return (
      /iPad|iPhone|iPod/.test(userAgent) && 
      (standalone === true || window.matchMedia('(display-mode: standalone)').matches)
    )
  }

  private async tryDirectFetch(url: string): Promise<string | null> {
    try {
      // Attempt direct fetch first - might work for some URLs
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0)',
        },
        signal: AbortSignal.timeout(8000)
      })
      
      if (response.ok) {
        const content = await response.text()
        if (content && content.length > 100) {
          console.log('Direct fetch successful')
          return content
        }
      }
    } catch (error) {
      console.log('Direct fetch failed:', error instanceof Error ? error.message : error)
    }
    return null
  }

  async scrapeArticle(url: string): Promise<Partial<Article>> {
    // Normalize URL
    const normalizedUrl = this.normalizeUrl(url)
    const isIOSPWA = this.isIOSPWA()
    
    let htmlContent = ''
    let lastError: Error | null = null

    console.log(`Scraping article: ${normalizedUrl}`)
    if (isIOSPWA) {
      console.log('iOS PWA detected - using enhanced extraction methods')
    }

    // iOS PWA: Try direct fetch first
    if (isIOSPWA) {
      const directContent = await this.tryDirectFetch(normalizedUrl)
      if (directContent) {
        htmlContent = directContent
      }
    }

    // If direct fetch failed or not iOS, try CORS proxies
    if (!htmlContent) {
      const proxiesToTry = isIOSPWA ? this.corsProxies.slice(0, 3) : this.corsProxies // Limit for iOS
      
      for (let i = 0; i < proxiesToTry.length; i++) {
        const proxy = proxiesToTry[i]
        console.log(`Trying proxy ${i + 1}/${proxiesToTry.length}: ${proxy}`)
        
        try {
          const proxyUrl = proxy + encodeURIComponent(normalizedUrl)
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'User-Agent': 'Mozilla/5.0 (compatible; CocoaReader/1.0)',
            },
            // Shorter timeout for iOS
            signal: AbortSignal.timeout(isIOSPWA ? 8000 : 10000)
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
    }

    if (!htmlContent) {
      // Enhanced fallback for iOS PWA - try to extract readable content from URL
      console.warn('All extraction methods failed, creating enhanced fallback article')
      const enhancedFallback = await this.createEnhancedFallback(normalizedUrl)
      return enhancedFallback
    }

    // Parse HTML and extract content
    return this.extractArticleContent(htmlContent, normalizedUrl)
  }

  private async createEnhancedFallback(url: string): Promise<Partial<Article>> {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const path = urlObj.pathname
      
      // Try to extract meaningful title from URL structure
      let title = this.extractTitleFromUrl(url)
      
      // Generate more meaningful content based on URL
      let excerpt = `This article from ${domain} could not be fully loaded due to network restrictions in PWA mode.`
      let textContent = `Article from ${domain}\n\nThe full content of this article could not be extracted due to cross-origin restrictions. This is common in PWA mode on iOS devices.\n\nTo read the complete article, please visit the original URL.`
      
      // Try to infer content type from URL patterns
      if (path.includes('/blog/') || path.includes('/post/') || path.includes('/article/')) {
        textContent += `\n\nThis appears to be a blog post or article.`
      } else if (path.includes('/news/')) {
        textContent += `\n\nThis appears to be a news article.`
      } else if (path.includes('/docs/') || path.includes('/documentation/')) {
        textContent += `\n\nThis appears to be documentation.`
      }
      
      return {
        url,
        title,
        domain,
        excerpt,
        cleanedHTML: `
          <div class="fallback-content">
            <h2>${title}</h2>
            <p class="domain-info">Source: <a href="${url}" target="_blank">${domain}</a></p>
            <p>${excerpt}</p>
            <div class="content-placeholder">
              <p>The full content could not be extracted due to cross-origin restrictions in PWA mode.</p>
              <p><strong>This is a limitation of iOS Safari PWA security policies.</strong></p>
              <p>To read the complete article, please:</p>
              <ol>
                <li>Click the link above to visit the original article</li>
                <li>Or try adding the article again when connected to WiFi</li>
                <li>Some content may be available if you refresh the page</li>
              </ol>
            </div>
          </div>
        `,
        textContent,
        readingTime: 1
      }
    } catch (error) {
      // Absolute fallback
      return {
        url,
        title: 'Article Link',
        domain: 'unknown',
        excerpt: 'Article link saved for later access.',
        cleanedHTML: `<p>Article saved: <a href="${url}" target="_blank">${url}</a></p>`,
        textContent: 'Article link saved for offline access.',
        readingTime: 1
      }
    }
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

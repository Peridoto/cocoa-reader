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
      const isIOSPWA = this.isIOSPWA()
      
      // Try to extract meaningful title from URL structure
      let title = this.extractTitleFromUrl(url)
      
      // Intelligent content generation based on URL patterns
      const contentInfo = this.generateIntelligentContent(url, domain, path)
      
      // Create meaningful excerpt and content
      let excerpt = contentInfo.excerpt
      let textContent = contentInfo.textContent
      let cleanedHTML = contentInfo.html
      
      // Add iOS PWA specific guidance only if actually in iOS PWA mode
      if (isIOSPWA) {
        textContent += `\n\nNote: Content extraction is limited in iOS PWA mode due to security restrictions.`
      }
      
      return {
        url,
        title,
        domain,
        excerpt,
        cleanedHTML,
        textContent,
        readingTime: contentInfo.estimatedReadingTime
      }
    } catch (error) {
      // Absolute fallback
      return {
        url,
        title: 'Saved Article',
        domain: 'unknown',
        excerpt: 'Article link saved for later reading.',
        cleanedHTML: `<div><h2>Saved Article</h2><p>Link: <a href="${url}" target="_blank">${url}</a></p></div>`,
        textContent: 'Article link saved for offline access.',
        readingTime: 1
      }
    }
  }

  private generateIntelligentContent(url: string, domain: string, path: string): {
    excerpt: string;
    textContent: string;
    html: string;
    estimatedReadingTime: number;
  } {
    // Analyze URL patterns to provide intelligent content
    const patterns = this.analyzeUrlPatterns(url, domain, path)
    
    let content = ''
    let contentType = 'article'
    let estimatedReadingTime = 3
    
    // GitHub repository or file
    if (domain.includes('github.com')) {
      const pathParts = path.split('/').filter(p => p)
      if (pathParts.length >= 2) {
        const owner = pathParts[0]
        const repo = pathParts[1]
        
        if (pathParts.includes('blob') || pathParts.includes('tree')) {
          // It's a file or directory
          const fileName = pathParts[pathParts.length - 1]
          content = `GitHub Repository: ${owner}/${repo}\n\nFile: ${fileName}\n\nThis appears to be source code or documentation from the ${repo} repository by ${owner}. The file contains development resources that may include code examples, documentation, or project information.`
          contentType = 'code repository'
        } else if (pathParts.includes('issues')) {
          content = `GitHub Issue in ${owner}/${repo}\n\nThis is a GitHub issue or discussion thread containing development-related conversations, bug reports, or feature requests.`
          contentType = 'issue tracker'
        } else if (pathParts.includes('pull')) {
          content = `GitHub Pull Request in ${owner}/${repo}\n\nThis is a pull request containing code changes and development discussions.`
          contentType = 'pull request'
        } else {
          content = `GitHub Repository: ${owner}/${repo}\n\nThis is a software development repository containing source code, documentation, and project resources.`
          contentType = 'repository'
        }
      }
    }
    
    // Documentation sites
    else if (patterns.isDocumentation) {
      content = `Documentation from ${domain}\n\nThis appears to be technical documentation or API reference material. It likely contains detailed information about software usage, implementation guides, or technical specifications.`
      contentType = 'documentation'
      estimatedReadingTime = 5
    }
    
    // Blog posts
    else if (patterns.isBlog) {
      content = `Blog Post from ${domain}\n\nThis appears to be a blog article or opinion piece. It likely contains insights, tutorials, or commentary on various topics.`
      contentType = 'blog post'
      estimatedReadingTime = 4
    }
    
    // News articles
    else if (patterns.isNews) {
      content = `News Article from ${domain}\n\nThis appears to be a news article containing current events, reporting, or journalistic content.`
      contentType = 'news article'
      estimatedReadingTime = 3
    }
    
    // Research or academic content
    else if (patterns.isAcademic) {
      content = `Academic Content from ${domain}\n\nThis appears to be research, academic papers, or scholarly content with in-depth analysis and citations.`
      contentType = 'academic content'
      estimatedReadingTime = 8
    }
    
    // Forums or discussions
    else if (patterns.isForum) {
      content = `Discussion Thread from ${domain}\n\nThis appears to be a forum discussion or community conversation with multiple participants sharing insights and experiences.`
      contentType = 'forum discussion'
      estimatedReadingTime = 3
    }
    
    // Default intelligent content
    else {
      const title = this.extractTitleFromUrl(url)
      content = `Content from ${domain}\n\nBased on the URL structure, this appears to be: "${title}"\n\nThis content source typically provides informative material relevant to its domain and topic area.`
      estimatedReadingTime = 3
    }
    
    // Add helpful context about the source
    content += `\n\nSource Domain: ${domain}`
    content += `\nContent Type: ${contentType}`
    content += `\nOriginal URL: ${url}`
    
    // Add reading recommendation
    content += `\n\nRecommendation: Visit the original link for the complete content with all images, formatting, and interactive elements.`
    
    const excerpt = content.split('\n')[0] + (content.split('\n')[1] ? ' ' + content.split('\n')[1] : '')
    
    const html = `
      <article class="intelligent-fallback">
        <header>
          <h1>${this.extractTitleFromUrl(url)}</h1>
          <div class="source-info">
            <span class="domain">${domain}</span>
            <span class="content-type">${contentType}</span>
          </div>
        </header>
        
        <div class="content-preview">
          ${content.split('\n').map(paragraph => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
          ).join('')}
        </div>
        
        <footer class="article-actions">
          <a href="${url}" target="_blank" class="read-original">
            📖 Read Original Article
          </a>
          <div class="reading-time">
            ⏱️ Estimated reading time: ${estimatedReadingTime} min
          </div>
        </footer>
      </article>
    `
    
    return {
      excerpt: excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt,
      textContent: content,
      html: html,
      estimatedReadingTime
    }
  }

  private analyzeUrlPatterns(url: string, domain: string, path: string): {
    isBlog: boolean;
    isNews: boolean;
    isDocumentation: boolean;
    isAcademic: boolean;
    isForum: boolean;
    isCode: boolean;
  } {
    const lowerPath = path.toLowerCase()
    const lowerDomain = domain.toLowerCase()
    
    return {
      isBlog: (
        lowerPath.includes('/blog/') || 
        lowerPath.includes('/post/') || 
        lowerPath.includes('/article/') ||
        lowerDomain.includes('blog') ||
        lowerDomain.includes('medium.com') ||
        lowerDomain.includes('substack.com')
      ),
      
      isNews: (
        lowerPath.includes('/news/') ||
        lowerDomain.includes('news') ||
        lowerDomain.includes('reuters') ||
        lowerDomain.includes('bbc') ||
        lowerDomain.includes('cnn') ||
        lowerDomain.includes('nytimes') ||
        lowerDomain.includes('guardian') ||
        lowerDomain.includes('techcrunch') ||
        lowerDomain.includes('arstechnica')
      ),
      
      isDocumentation: (
        lowerPath.includes('/docs/') ||
        lowerPath.includes('/documentation/') ||
        lowerPath.includes('/api/') ||
        lowerPath.includes('/guide/') ||
        lowerPath.includes('/tutorial/') ||
        lowerDomain.includes('docs') ||
        lowerDomain.includes('developer') ||
        lowerDomain.includes('api')
      ),
      
      isAcademic: (
        lowerPath.includes('/paper/') ||
        lowerPath.includes('/research/') ||
        lowerPath.includes('/publication/') ||
        lowerDomain.includes('arxiv') ||
        lowerDomain.includes('scholar') ||
        lowerDomain.includes('researchgate') ||
        lowerDomain.includes('academia') ||
        lowerDomain.includes('.edu')
      ),
      
      isForum: (
        lowerDomain.includes('reddit') ||
        lowerDomain.includes('stackoverflow') ||
        lowerDomain.includes('discourse') ||
        lowerDomain.includes('forum') ||
        lowerPath.includes('/forum/') ||
        lowerPath.includes('/discussion/') ||
        lowerPath.includes('/thread/')
      ),
      
      isCode: (
        lowerDomain.includes('github') ||
        lowerDomain.includes('gitlab') ||
        lowerDomain.includes('bitbucket') ||
        lowerPath.includes('/src/') ||
        lowerPath.includes('/code/')
      )
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
}

export const clientScraper = new ClientScraper()

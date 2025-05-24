import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrapeArticle } from '../src/lib/scraper'

// Mock the web-ethics module
const mockCheckScrapingPermissions = vi.fn()
const mockApplyCrawlDelay = vi.fn()
const mockParseMetaAndHeaders = vi.fn()

vi.mock('../src/lib/web-ethics', () => ({
  checkScrapingPermissions: mockCheckScrapingPermissions,
  applyCrawlDelay: mockApplyCrawlDelay,
  parseMetaAndHeaders: mockParseMetaAndHeaders,
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Article Scraper with Ethics Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should scrape article content successfully when permissions allow', async () => {
    // Mock ethics checks to allow scraping
    mockCheckScrapingPermissions.mockResolvedValueOnce({
      allowed: true,
      reason: 'Scraping is allowed',
      crawlDelay: undefined,
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    })
    
    mockParseMetaAndHeaders.mockReturnValueOnce({
      noarchive: false,
      noindex: false,
      nofollow: false
    })
    
    const mockHtml = `
      <html>
        <head><title>Test Article</title></head>
        <body>
          <article>
            <h1>Test Article Title</h1>
            <p>This is the main content of the article.</p>
            <p>More content here.</p>
          </article>
        </body>
      </html>
    `

    // Mock the fetch calls
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
      headers: new Headers()
    })

    const result = await scrapeArticle('https://example.com/test-article')

    expect(result.title).toBe('Test Article')
    expect(result.domain).toBe('example.com')
    expect(result.cleanedHTML).toContain('Test Article Title')
    expect(result.textContent).toContain('This is the main content')
    expect(result.ethicsCompliant).toBe(true)
    expect(result.permissions.allowed).toBe(true)
  })

  it('should respect crawl delay when specified', async () => {
    mockCheckScrapingPermissions.mockResolvedValueOnce({
      allowed: true,
      reason: 'Scraping is allowed',
      crawlDelay: 2,
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    })
    
    mockParseMetaAndHeaders.mockReturnValueOnce({
      noarchive: false,
      noindex: false,
      nofollow: false
    })

    const mockHtml = '<html><head><title>Test</title></head><body><p>Content</p></body></html>'
    
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
      headers: new Headers()
    })

    await scrapeArticle('https://example.com/test')

    expect(mockApplyCrawlDelay).toHaveBeenCalledWith(2)
  })

  it('should refuse to scrape when permissions deny access', async () => {
    mockCheckScrapingPermissions.mockResolvedValueOnce({
      allowed: false,
      reason: 'URL is disallowed by robots.txt',
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    })

    await expect(scrapeArticle('https://example.com/private/page')).rejects.toThrow(
      'Scraping not permitted: URL is disallowed by robots.txt'
    )
  })

  it('should refuse to scrape pages with noarchive directive', async () => {
    mockCheckScrapingPermissions.mockResolvedValueOnce({
      allowed: true,
      reason: 'Scraping is allowed',
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    })
    
    mockParseMetaAndHeaders.mockReturnValueOnce({
      noarchive: true,
      noindex: false,
      nofollow: false
    })

    const mockHtml = '<html><head><title>Test</title><meta name="robots" content="noarchive"></head><body><p>Content</p></body></html>'
    
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
      headers: new Headers()
    })

    await expect(scrapeArticle('https://example.com/noarchive-page')).rejects.toThrow(
      'Page contains noarchive directive'
    )
  })

  it('should handle fetch errors during ethics check', async () => {
    mockCheckScrapingPermissions.mockRejectedValueOnce(new Error('Network error during ethics check'))

    await expect(scrapeArticle('https://invalid-url.com')).rejects.toThrow(
      'Failed to scrape article ethically'
    )
  })

  it('should handle HTTP errors', async () => {
    mockCheckScrapingPermissions.mockResolvedValueOnce({
      allowed: true,
      reason: 'Scraping is allowed',
      respectHeaders: { noarchive: false, noindex: false, nofollow: false }
    })

    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(scrapeArticle('https://example.com/not-found')).rejects.toThrow(
      'HTTP error! status: 404'
    )
  })
})

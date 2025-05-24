import { describe, it, expect, vi } from 'vitest'
import { scrapeArticle } from '../src/lib/scraper'

// Mock fetch globally
global.fetch = vi.fn()

describe('Article Scraper', () => {
  it('should scrape article content successfully', async () => {
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

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    })

    const result = await scrapeArticle('https://example.com/test-article')

    expect(result.title).toBe('Test Article Title')
    expect(result.domain).toBe('example.com')
    expect(result.cleanedHTML).toContain('Test Article Title')
    expect(result.textContent).toContain('This is the main content')
  })

  it('should handle fetch errors', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    await expect(scrapeArticle('https://invalid-url.com')).rejects.toThrow(
      'Failed to scrape article'
    )
  })

  it('should handle HTTP errors', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(scrapeArticle('https://example.com/not-found')).rejects.toThrow(
      'Failed to scrape article'
    )
  })
})

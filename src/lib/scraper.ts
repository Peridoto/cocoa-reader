import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export interface ScrapedContent {
  title: string
  domain: string
  excerpt: string | null
  cleanedHTML: string
  textContent: string
}

/**
 * Scrapes and cleans content from a given URL using Mozilla Readability
 * @param url The URL to scrape
 * @returns Promise<ScrapedContent> The cleaned content
 */
export async function scrapeArticle(url: string): Promise<ScrapedContent> {
  try {
    console.log('Starting scrape for URL:', url)
    
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReadLaterBot/1.0)',
      },
    })
    
    console.log('Fetch response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    console.log('HTML length:', html.length)
    
    // Parse with JSDOM
    const dom = new JSDOM(html, { url })
    const document = dom.window.document
    
    // Extract domain
    const domain = new URL(url).hostname
    console.log('Extracted domain:', domain)
    
    // Use Readability to extract clean content
    const reader = new Readability(document)
    const article = reader.parse()
    
    if (!article) {
      throw new Error('Could not parse article content')
    }
    
    console.log('Article parsed successfully:', {
      title: article.title,
      contentLength: article.content.length
    })
    
    return {
      title: article.title || 'Untitled Article',
      domain,
      excerpt: article.excerpt || null,
      cleanedHTML: article.content,
      textContent: article.textContent || '',
    }
  } catch (error) {
    console.error('Error scraping article:', error)
    throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

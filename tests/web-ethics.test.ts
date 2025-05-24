import { describe, it, expect } from 'vitest'
import { 
  parseRobotsTxt, 
  isPathAllowed, 
  parseMetaAndHeaders 
} from '../src/lib/web-ethics'

describe('Web Ethics Compliance', () => {
  describe('parseRobotsTxt', () => {
    it('should parse basic robots.txt correctly', () => {
      const robotsTxt = `
        User-agent: *
        Disallow: /private/
        Disallow: /admin/
        Allow: /public/
        Crawl-delay: 10
        Sitemap: https://example.com/sitemap.xml
        
        User-agent: googlebot
        Disallow: /secret/
        Allow: /
      `
      
      const rules = parseRobotsTxt(robotsTxt)
      
      expect(rules).toHaveLength(2)
      expect(rules[0].userAgent).toBe('*')
      expect(rules[0].disallowed).toEqual(['/private/', '/admin/'])
      expect(rules[0].allowed).toEqual(['/public/'])
      expect(rules[0].crawlDelay).toBe(10)
      expect(rules[0].sitemaps).toEqual(['https://example.com/sitemap.xml'])
      
      expect(rules[1].userAgent).toBe('googlebot')
      expect(rules[1].disallowed).toEqual(['/secret/'])
      expect(rules[1].allowed).toEqual(['/'])
    })
    
    it('should handle empty robots.txt', () => {
      const rules = parseRobotsTxt('')
      expect(rules).toHaveLength(0)
    })
    
    it('should ignore comments and empty lines', () => {
      const robotsTxt = `
        # This is a comment
        User-agent: *
        # Another comment
        Disallow: /test/
        
        # Empty line above
      `
      
      const rules = parseRobotsTxt(robotsTxt)
      expect(rules).toHaveLength(1)
      expect(rules[0].disallowed).toEqual(['/test/'])
    })
  })
  
  describe('isPathAllowed', () => {
    const rules = parseRobotsTxt(`
      User-agent: *
      Disallow: /private/
      Disallow: /admin
      Allow: /admin/public
      
      User-agent: readlaterbot
      Disallow: /secret/
      Allow: /
    `)
    
    it('should allow paths not explicitly disallowed', () => {
      expect(isPathAllowed('/public/page', rules)).toBe(true)
      expect(isPathAllowed('/articles/123', rules)).toBe(true)
    })
    
    it('should disallow explicitly disallowed paths', () => {
      expect(isPathAllowed('/private/data', rules)).toBe(false)
      expect(isPathAllowed('/admin/settings', rules)).toBe(false)
    })
    
    it('should respect explicit allows over disallows', () => {
      expect(isPathAllowed('/admin/public/info', rules)).toBe(true)
    })
    
    it('should handle specific user agent rules', () => {
      expect(isPathAllowed('/secret/data', rules)).toBe(false)
    })
    
    it('should default to allowed for empty rules', () => {
      expect(isPathAllowed('/anything', [])).toBe(true)
    })
  })
  
  describe('parseMetaAndHeaders', () => {
    it('should parse meta robots tags correctly', () => {
      // Create a mock document
      const mockDocument = {
        querySelector: (selector: string) => {
          if (selector === 'meta[name="robots"]') {
            return { getAttribute: () => 'noindex, noarchive' }
          }
          return null
        }
      } as unknown as Document
      
      const mockHeaders = new Headers()
      
      const result = parseMetaAndHeaders(mockDocument, mockHeaders)
      
      expect(result.noindex).toBe(true)
      expect(result.noarchive).toBe(true)
      expect(result.nofollow).toBe(false)
    })
    
    it('should parse X-Robots-Tag header correctly', () => {
      const mockDocument = {
        querySelector: () => null
      } as unknown as Document
      
      const mockHeaders = new Headers()
      mockHeaders.set('X-Robots-Tag', 'noarchive, nofollow')
      
      const result = parseMetaAndHeaders(mockDocument, mockHeaders)
      
      expect(result.noarchive).toBe(true)
      expect(result.nofollow).toBe(true)
      expect(result.noindex).toBe(false)
    })
    
    it('should handle multiple robot directives', () => {
      const mockDocument = {
        querySelector: (selector: string) => {
          if (selector === 'meta[name="robots"]') {
            return { getAttribute: () => 'noindex' }
          }
          if (selector === 'meta[name="googlebot"]') {
            return { getAttribute: () => 'noarchive' }
          }
          return null
        }
      } as unknown as Document
      
      const mockHeaders = new Headers()
      mockHeaders.set('X-Robots-Tag', 'nofollow')
      
      const result = parseMetaAndHeaders(mockDocument, mockHeaders)
      
      expect(result.noindex).toBe(true)
      expect(result.noarchive).toBe(true)
      expect(result.nofollow).toBe(true)
    })
    
    it('should return false for all directives when none are present', () => {
      const mockDocument = {
        querySelector: () => null
      } as unknown as Document
      
      const mockHeaders = new Headers()
      
      const result = parseMetaAndHeaders(mockDocument, mockHeaders)
      
      expect(result.noindex).toBe(false)
      expect(result.noarchive).toBe(false)
      expect(result.nofollow).toBe(false)
    })
  })
})

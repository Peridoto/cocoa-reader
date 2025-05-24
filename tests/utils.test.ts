import { describe, it, expect } from 'vitest'
import { normalizeUrl } from '../src/lib/utils'

describe('normalizeUrl', () => {
  it('should add https:// to URLs without protocol', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
    expect(normalizeUrl('google.com/search')).toBe('https://google.com/search')
    expect(normalizeUrl('subdomain.example.com/path?query=1')).toBe('https://subdomain.example.com/path?query=1')
  })

  it('should preserve URLs that already have https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    expect(normalizeUrl('https://google.com/search')).toBe('https://google.com/search')
  })

  it('should preserve URLs that already have http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
    expect(normalizeUrl('http://localhost:3000')).toBe('http://localhost:3000')
  })

  it('should handle URLs that start with //', () => {
    expect(normalizeUrl('//example.com')).toBe('https://example.com')
    expect(normalizeUrl('//cdn.example.com/asset.js')).toBe('https://cdn.example.com/asset.js')
  })

  it('should handle empty and whitespace strings', () => {
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl('   ')).toBe('')
  })

  it('should trim whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com')
    expect(normalizeUrl('\t\nhttps://example.com\n\t')).toBe('https://example.com')
  })
})

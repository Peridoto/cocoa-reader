# Web Ethics Compliance Documentation

## Overview

Cocoa Reader now implements comprehensive web ethics compliance to ensure responsible web scraping. The application respects website owners' preferences and follows established web standards.

## Features Implemented

### 🤖 robots.txt Compliance
- **Automatic Checking**: Before scraping any URL, the application fetches and parses the site's `robots.txt` file
- **User-Agent Respect**: Recognizes rules for `*`, `readlaterbot`, `cocoa-reader`, and other common user agents
- **Path Validation**: Checks if the specific URL path is allowed or disallowed
- **Crawl Delay**: Automatically applies any specified crawl delays between requests

### 🏷️ Meta Tags & HTTP Headers
- **noarchive Directive**: Refuses to save content when `noarchive` is specified in:
  - `<meta name="robots" content="noarchive">`
  - `<meta name="googlebot" content="noarchive">`
  - `X-Robots-Tag: noarchive` HTTP header
- **noindex/nofollow**: Detects and logs these directives (future extensibility)
- **Multiple Sources**: Parses directives from meta tags and HTTP headers

### 🕐 Rate Limiting
- **Crawl Delay Respect**: Automatically waits the specified time from robots.txt
- **Responsible Fetching**: Uses proper HTTP headers and user agent identification
- **Graceful Degradation**: Continues if robots.txt is not accessible

### 🔍 Transparency & Logging
- **Ethics Compliance Logging**: All scraping decisions are logged with reasons
- **Permission Tracking**: Stores whether scraping was allowed and why
- **Error Handling**: Clear error messages when scraping is denied

## Implementation Details

### Core Module: `/src/lib/web-ethics.ts`

```typescript
// Main function to check scraping permissions
checkScrapingPermissions(url: string): Promise<ScrapingPermissions>

// Parse and validate robots.txt content
parseRobotsTxt(robotsTxt: string): RobotsRule[]

// Check if a specific path is allowed
isPathAllowed(path: string, rules: RobotsRule[]): boolean

// Parse meta tags and headers for directives
parseMetaAndHeaders(document: Document, headers: Headers): RespectHeaders

// Apply crawl delay when specified
applyCrawlDelay(delay?: number): Promise<void>
```

### Enhanced Scraper: `/src/lib/scraper.ts`

The scraper now follows this ethical workflow:

1. **Check Permissions**: Validate against robots.txt and get crawl delay
2. **Apply Rate Limiting**: Wait for specified crawl delay if any
3. **Fetch Content**: Use proper headers and user agent
4. **Parse Ethics**: Check for noarchive and other directives in content
5. **Respect Directives**: Refuse to save if noarchive is specified
6. **Return Results**: Include ethics compliance information

### Example Usage

```typescript
// The scraper automatically handles all ethics checks
const result = await scrapeArticle('https://example.com/article')

// Result includes ethics information
console.log(result.ethicsCompliant) // true/false
console.log(result.permissions.reason) // "Scraping is allowed" or error reason
```

## Respect for Website Owners

### What We Check
- ✅ **robots.txt** - Site-wide scraping rules
- ✅ **noarchive** - Explicit no-archiving directives
- ✅ **Crawl delays** - Rate limiting requests
- ✅ **User agent** - Proper identification
- ✅ **HTTP headers** - X-Robots-Tag compliance

### What We Don't Do
- ❌ Ignore robots.txt files
- ❌ Scrape disallowed paths
- ❌ Archive noarchive content
- ❌ Exceed rate limits
- ❌ Hide our identity

### Future Enhancements
- 🔄 **Respect Cache-Control headers**
- 🔄 **Honor retry-after headers**
- 🔄 **Support for extended robots.txt directives**
- 🔄 **Sitemap integration for discovery**

## Error Handling

When scraping is not allowed, the application provides clear error messages:

- `"URL is disallowed by robots.txt"`
- `"Page has noarchive directive - scraping not permitted"`
- `"Crawl delay exceeded maximum wait time"`
- `"HTTP error! status: 403 - Forbidden"`

## Testing

Comprehensive test suite covers:
- robots.txt parsing edge cases
- Meta tag directive detection
- Permission checking logic
- Rate limiting functionality
- Error handling scenarios

Run tests with:
```bash
npm test
```

## Compliance Standards

This implementation follows:
- **REP (Robots Exclusion Protocol)** - robots.txt standard
- **Google's robots meta tag specifications**
- **HTTP X-Robots-Tag header standard**
- **Web crawling best practices**
- **Ethical web scraping guidelines**

## User Benefits

- **Peace of Mind**: Know that scraping respects website policies
- **Transparency**: See exactly why scraping was allowed or denied
- **Reliability**: Reduced risk of being blocked by websites
- **Performance**: Automatic rate limiting prevents overwhelming servers
- **Compliance**: Follows industry standards and best practices

---

*Cocoa Reader is committed to ethical web scraping and respecting website owners' rights and preferences.*

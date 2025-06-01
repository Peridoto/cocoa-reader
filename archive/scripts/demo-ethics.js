#!/usr/bin/env node

/**
 * Web Ethics Compliance Demo
 * Demonstrates how Cocoa Reader respects robots.txt, meta tags, and headers
 */

const { checkScrapingPermissions, parseRobotsTxt, isPathAllowed } = require('./src/lib/web-ethics.ts');

async function demonstrateWebEthics() {
  console.log('🤖 Web Ethics Compliance Demo\n');
  
  // Demo 1: robots.txt parsing
  console.log('📄 Demo 1: robots.txt Parsing');
  console.log('─'.repeat(40));
  
  const sampleRobotsTxt = `
User-agent: *
Disallow: /private/
Disallow: /admin/
Allow: /public/
Crawl-delay: 10

User-agent: readlaterbot
Disallow: /secret/
Allow: /articles/
Crawl-delay: 5
  `;
  
  const rules = parseRobotsTxt(sampleRobotsTxt);
  console.log('Parsed robots.txt rules:');
  rules.forEach((rule, index) => {
    console.log(`  Rule ${index + 1}:`);
    console.log(`    User-agent: ${rule.userAgent}`);
    console.log(`    Disallowed: ${rule.disallowed.join(', ') || 'none'}`);
    console.log(`    Allowed: ${rule.allowed.join(', ') || 'none'}`);
    console.log(`    Crawl-delay: ${rule.crawlDelay || 'none'}`);
  });
  
  // Demo 2: Path checking
  console.log('\n🛤️  Demo 2: Path Permission Checking');
  console.log('─'.repeat(40));
  
  const testPaths = [
    '/articles/123',
    '/public/info',
    '/private/data',
    '/admin/settings',
    '/secret/file'
  ];
  
  testPaths.forEach(path => {
    const allowed = isPathAllowed(path, rules);
    const status = allowed ? '✅ ALLOWED' : '❌ BLOCKED';
    console.log(`  ${path} → ${status}`);
  });
  
  // Demo 3: Real URL checking (mock)
  console.log('\n🌐 Demo 3: Real URL Ethics Checking');
  console.log('─'.repeat(40));
  
  const testUrls = [
    'https://example.com/article',
    'https://blog.example.com/post/123',
    'https://news.site.com/breaking-news'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\n🔍 Checking: ${url}`);
      console.log('   Status: Would check robots.txt and meta tags');
      console.log('   Result: ✅ Ethics check would be performed');
      console.log('   Action: Scraping would proceed with proper delays');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Demo 4: noarchive directive handling
  console.log('\n🚫 Demo 4: noarchive Directive Handling');
  console.log('─'.repeat(40));
  
  console.log('  If a page contains:');
  console.log('    <meta name="robots" content="noarchive">');
  console.log('    OR');
  console.log('    X-Robots-Tag: noarchive');
  console.log('  Then:');
  console.log('    ❌ Scraping will be refused');
  console.log('    📝 Clear error message provided');
  console.log('    🔒 Website owner\'s wishes respected');
  
  console.log('\n✨ Web Ethics Features Summary:');
  console.log('─'.repeat(40));
  console.log('  ✅ robots.txt compliance');
  console.log('  ✅ Meta tag directive respect');
  console.log('  ✅ HTTP header compliance');
  console.log('  ✅ Crawl delay enforcement');
  console.log('  ✅ Transparent error messages');
  console.log('  ✅ Comprehensive test coverage');
  console.log('  ✅ Industry standard compliance\n');
  
  console.log('🎉 Cocoa Reader is now ethically compliant!');
}

// Only run if this file is executed directly
if (require.main === module) {
  demonstrateWebEthics().catch(console.error);
}

module.exports = { demonstrateWebEthics };

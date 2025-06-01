# 🚀 Cocoa Reader PWA - Production Deployment Guide

## Overview
This guide provides complete instructions for deploying the Cocoa Reader PWA to production with full Web Share Target functionality.

## Prerequisites
- Node.js 18+ installed
- Git repository access
- Modern web browser for testing
- Mobile device for final testing

## Quick Deploy Options

### Option 1: Vercel (Recommended)
Vercel provides the best Next.js hosting with automatic PWA optimization.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd /path/to/cocoa-readerweb
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: cocoa-reader
# - Directory: ./
# - Override settings? No
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

### Option 2: Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify:
# 1. Drag and drop the .next folder to netlify.com
# 2. Or connect GitHub repo for automatic deploys
```

**Netlify Settings:**
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18

### Option 3: Other Platforms
- **Railway**: Connect GitHub, automatic deploys
- **DigitalOcean App Platform**: Container-based deployment
- **Heroku**: Add buildpack for Next.js
- **AWS Amplify**: Full-stack deployment

## Post-Deployment Configuration

### 1. Update Manifest URLs
After deployment, update the manifest with your production URL:

```json
{
  "start_url": "https://your-domain.com/",
  "scope": "https://your-domain.com/",
  "share_target": {
    "action": "https://your-domain.com/share",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title",
      "text": "text"
    }
  }
}
```

### 2. SSL Certificate
Ensure HTTPS is enabled (most platforms do this automatically):
- PWA features require HTTPS
- Web Share Target API requires secure context
- Service Worker requires HTTPS

### 3. Custom Domain (Optional)
Set up a custom domain for better branding:
- `your-app.com` 
- `readlater.yourname.com`
- Configure DNS CNAME records

## Testing Production Deployment

### 1. Basic Functionality Test
```bash
# Test the deployed URL
curl -I https://your-domain.com

# Check manifest
curl https://your-domain.com/manifest.json

# Verify service worker
curl https://your-domain.com/sw.js
```

### 2. PWA Installation Test
1. Open deployed URL on mobile device
2. Look for "Add to Home Screen" prompt
3. Install the PWA
4. Verify offline functionality

### 3. Web Share Target Test
1. Open any website on mobile
2. Tap share button
3. Look for your app in share sheet
4. Test sharing a URL to your app

## Environment Variables

### Required Variables
Most functionality works without external APIs, but you can configure:

```env
# Optional: Custom database URL
DATABASE_URL="file:./dev.db"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="your-ga-id"

# Optional: Error reporting
SENTRY_DSN="your-sentry-dsn"
```

### Platform-Specific Setup

#### Vercel
```bash
# Set environment variables
vercel env add DATABASE_URL
# Enter: file:./dev.db

# Redeploy with new env vars
vercel --prod
```

#### Netlify
Add environment variables in the Netlify dashboard:
- Site settings → Environment variables
- Add `DATABASE_URL=file:./dev.db`

## Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build
npm run analyze  # If configured

# Check performance
npm run lighthouse  # If configured
```

### 2. CDN Configuration
Most platforms automatically configure CDN:
- Static assets cached globally
- Service worker enables offline access
- Manifest cached for PWA functionality

### 3. Monitoring Setup
```javascript
// Add to _app.tsx for basic analytics
if (typeof window !== 'undefined') {
  // Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
  
  // Custom PWA analytics
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      // Track PWA usage
    });
  }
}
```

## Troubleshooting

### Common Issues

#### 1. PWA Not Installing
**Symptoms:**
- No "Add to Home Screen" prompt
- App doesn't appear installable

**Solutions:**
```bash
# Check manifest validity
curl https://your-domain.com/manifest.json | python3 -m json.tool

# Verify service worker
curl https://your-domain.com/sw.js

# Check browser dev tools:
# Application → Manifest
# Application → Service Workers
```

#### 2. Web Share Target Not Working
**Symptoms:**
- App doesn't appear in share sheet
- Shared URLs not captured

**Solutions:**
```javascript
// Verify manifest share_target
{
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title",
      "text": "text"
    }
  }
}

// Check browser support
if (navigator.canShare) {
  console.log('Web Share API supported');
}
```

#### 3. Content Extraction Failing
**Symptoms:**
- "Content could not be fetched" errors
- Articles not saving properly

**Solutions:**
```javascript
// Check CORS headers
fetch(url, {
  mode: 'cors',
  headers: {
    'User-Agent': 'Mozilla/5.0...'
  }
});

// Verify client-side scraper
// Check browser console for errors
```

#### 4. Database Issues
**Symptoms:**
- Articles not saving
- Data not persisting

**Solutions:**
```bash
# Check database file permissions
ls -la dev.db

# Verify Prisma schema
npx prisma db push

# Reset database if needed
rm dev.db
npx prisma db push
```

## Mobile Testing Checklist

### iOS Testing
- [ ] PWA installs from Safari
- [ ] App appears in home screen
- [ ] Share target works from Safari
- [ ] Share target works from other apps
- [ ] Content extraction works
- [ ] Offline functionality works

### Android Testing  
- [ ] PWA installs from Chrome
- [ ] App appears in app drawer
- [ ] Share target works from Chrome
- [ ] Share target works from other apps
- [ ] Content extraction works
- [ ] Offline functionality works

## Success Metrics

### Technical Metrics
- **Lighthouse PWA Score**: 90+
- **Performance Score**: 85+
- **Accessibility Score**: 95+
- **Service Worker**: Active and caching
- **Manifest**: Valid and complete

### User Experience Metrics
- **Installation**: < 3 taps to install
- **Share Integration**: Appears in system share menu
- **Content Processing**: < 5 seconds for most articles
- **Offline Access**: Full functionality without internet

## Security Considerations

### Content Security Policy
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https:;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

### Privacy Features
- All data stored locally (no external tracking)
- No user accounts required
- Content processed client-side
- Optional analytics with user consent

## Advanced Features

### Custom Domain Setup
```bash
# Vercel custom domain
vercel domains add your-domain.com
vercel domains verify your-domain.com

# Update manifest.json with new domain
# Redeploy application
```

### Analytics Integration
```javascript
// components/Analytics.tsx
'use client';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Track PWA installs
    window.addEventListener('beforeinstallprompt', (e) => {
      gtag('event', 'pwa_install_prompt_shown');
    });
    
    // Track PWA usage
    if (window.matchMedia('(display-mode: standalone)').matches) {
      gtag('event', 'pwa_launched');
    }
  }, []);
  
  return null;
}
```

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit fix

# Rebuild and redeploy
npm run build
vercel --prod
```

### Monitoring
- Check deployment logs regularly
- Monitor error rates
- Track PWA installation rates
- Monitor content extraction success rates

## Support Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Web Share Target API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_Target_API)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [PWA Community](https://web.dev/progressive-web-apps/)
- [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎉 Deployment Complete!

After following this guide, your Cocoa Reader PWA will be:
- ✅ Deployed to production
- ✅ Installable as a PWA
- ✅ Integrated with Web Share Target
- ✅ Working completely offline
- ✅ Optimized for mobile devices

**Next Steps:**
1. Share your PWA with users
2. Gather feedback and usage data
3. Monitor performance and errors
4. Plan future feature enhancements

# 🚀 Cocoa Reader - Static Deployment Guide

Your Cocoa Reader application has been successfully built as static files! Here's everything you need to know about deploying it to your web server.

## 📁 Static Build Output

The static build is located in the `out/` directory with the following structure:

```
out/
├── index.html          # Main homepage (Next.js generated)
├── standalone.html     # Self-contained version (works immediately!)
├── status.html         # Simple status page (standalone)
├── 404.html           # 404 error page
├── status/            # Status check page
│   └── index.html
├── debug/             # Debug information page
│   └── index.html
├── test/              # Test page
│   └── index.html
└── _next/             # Static assets (CSS, JS, fonts)
    ├── static/
    │   ├── css/       # Compiled Tailwind CSS
    │   ├── chunks/    # JavaScript bundles
    │   └── media/     # Fonts and other assets
    └── EFMo2oVbF143qW3986Xmo/  # Build-specific assets
```

## 🎯 Quick Test Options

### Option A: Standalone Version (Immediate Testing)
Simply open `out/standalone.html` in any browser - it works immediately without a server!
- ✅ Self-contained HTML with embedded CSS
- ✅ Dark/light theme toggle
- ✅ Interactive demo features
- ✅ No external dependencies (except Tailwind CDN)

### Option B: Full Static Build
Upload the entire `out/` directory to your web server for the complete experience.

## 🌐 How to Deploy

### Option 1: Upload to Traditional Web Hosting
1. **Compress the out folder**: `zip -r cocoa-reader-static.zip out/`
2. **Upload to your web server**: Upload all contents of the `out/` directory to your web server's public folder (usually `public_html`, `www`, or `htdocs`)
3. **Set up redirects** (optional): Configure your server to serve `index.html` for all routes

### Option 2: Use the Build Script
Run the automated build script:
```bash
./build-static.sh
```

This script will:
- ✅ Backup your dynamic files
- ✅ Set up static configuration
- ✅ Build the static export
- ✅ Restore your original files
- ✅ Generate the `out/` directory ready for upload

## 📋 What's Included in the Static Version

### ✅ Working Features:
- **Beautiful landing page** with feature showcase
- **Dark/light theme toggle** with system preference detection
- **Responsive design** that works on all devices
- **PWA metadata** for app-like experience
- **Status page** at `/status` for health checks
- **Debug page** at `/debug` for troubleshooting
- **Test page** at `/test` for functionality verification

### ❌ Limited Features:
- **No article saving** (requires server-side API)
- **No database functionality** (static export limitation)
- **No dynamic routing** (no `/read/[id]` pages)

## 🔧 Server Configuration (Optional)

### Apache (.htaccess)
Create a `.htaccess` file in your upload directory:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### Nginx
Add to your server configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# Cache static assets
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🎯 Testing Your Deployment

After uploading, test these URLs:
- **Homepage**: `https://yourdomain.com/`
- **Status page**: `https://yourdomain.com/status/`
- **Debug page**: `https://yourdomain.com/debug/`
- **Test page**: `https://yourdomain.com/test/`

## 🔄 For Full Functionality

To get the complete Cocoa Reader experience with article saving and reading:

1. **Deploy to a platform that supports Node.js**:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Railway: `railway deploy`
   - Your own VPS with Node.js

2. **Use the dynamic build**:
   ```bash
   pnpm build        # Regular Next.js build
   pnpm start        # Start production server
   ```

## 📊 Build Statistics

Your static build includes:
- **Homepage**: 2.85 kB (89.9 kB with JS)
- **Total bundle size**: ~87 kB shared JavaScript
- **CSS**: Optimized Tailwind CSS
- **Images**: Unoptimized for static compatibility

## 🛠️ Troubleshooting

### Missing Assets
- Ensure all files in `out/_next/` are uploaded
- Check file permissions on your server

### Routing Issues
- Make sure your server is configured to serve SPAs
- Add the appropriate redirects as shown above

### Theme Not Working
- Verify JavaScript files are loading correctly
- Check browser console for errors

---

🎉 **Congratulations!** Your Cocoa Reader static site is ready for deployment!

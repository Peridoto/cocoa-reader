# Cocoa Reader 📚

A modern, local-first read-later application built with Next.js 14. Save web articles and read them later in a clean, distraction-free environment that works completely offline.

## ✨ Features

- **🌐 Article Saving**: Paste any URL to save articles with automatic content extraction
- **📖 Clean Reading**: Distraction-free reading experience with beautiful typography
- **🌙 Dark Mode**: Automatic dark mode detection with manual toggle
- **📊 Progress Tracking**: Track reading progress with scroll-based completion
- **🔍 Search & Filter**: Find articles by title, domain, or content with read/unread filtering
- **📱 PWA Support**: Install as a native app with offline functionality
- **🔒 Privacy First**: 100% local storage, no external services or tracking
- **♿ Accessible**: AA contrast levels and full keyboard navigation support

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Content Processing**: Mozilla Readability + jsdom
- **PWA**: Service Worker with Workbox
- **Testing**: Vitest
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.0.0
- pnpm (installed automatically if missing)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd cocoaReader
   pnpm install
   ```

2. **Initialize database**:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! The app is ready to use with example articles already seeded.

## 📚 Usage

### Adding Articles
1. Paste any article URL in the input field
2. Click "Save Article" 
3. The app will automatically extract clean content

### Reading Articles
1. Click "Read" on any saved article
2. Enjoy distraction-free reading with progress tracking
3. Toggle read status and dark mode as needed

### Managing Articles
- **Filter**: Use "All", "Unread", "Read" filter buttons
- **Search**: Type in the search box to find articles
- **Delete**: Click delete button to remove articles

## 🗂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes for article management
│   ├── read/[id]/      # Reading page for individual articles
│   └── page.tsx        # Home page with article list
├── components/         # Reusable React components
├── lib/               # Utility functions and configurations
│   ├── prisma.ts      # Database client
│   ├── scraper.ts     # Article content extraction
│   └── utils.ts       # Helper functions
└── types/             # TypeScript type definitions

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Database seeding script

public/
├── manifest.json     # PWA manifest
└── sw.js            # Service worker for offline support
```

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Apply schema to database
pnpm db:reset         # Reset database and reseed
pnpm db:seed          # Seed with example data

# Testing & Quality
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm lint             # Run ESLint
```

### VS Code Configuration

The project includes VS Code configurations for debugging:

- **Debug server-side**: Debug Next.js API routes and server components
- **Debug client-side**: Debug React components in Chrome
- **Debug full stack**: Combined debugging experience

Press `F5` in VS Code to start debugging.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test scraper.test.ts
```

## 🗄 Database Schema

The application uses a simple SQLite database with a single `Article` table:

```sql
CREATE TABLE articles (
  id          TEXT PRIMARY KEY,
  url         TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  domain      TEXT NOT NULL,
  excerpt     TEXT,
  cleanedHTML TEXT NOT NULL,
  textContent TEXT NOT NULL,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  read        BOOLEAN DEFAULT FALSE,
  scroll      INTEGER DEFAULT 0
);
```

## 🔌 API Endpoints

- `POST /api/article` - Save a new article from URL
- `GET /api/articles` - List articles with pagination and filtering
- `GET /api/article/[id]` - Get single article content
- `PATCH /api/article/[id]` - Update read status or scroll progress
- `DELETE /api/article/[id]` - Delete an article

## 🌐 PWA Features

The app works as a Progressive Web App with:

- **Offline Support**: Read saved articles without internet
- **Install Prompt**: Add to home screen on mobile/desktop
- **Background Sync**: Sync reading progress when back online
- **App-like Experience**: Fullscreen mode without browser UI

## 🔧 Configuration

### Environment Variables

No environment variables required! The app works out of the box with local SQLite.

### Customization

- **Fonts**: Edit `tailwind.config.js` to change typography
- **Colors**: Modify CSS custom properties in `globals.css`
- **Database**: Update `prisma/schema.prisma` for schema changes

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

If you encounter any issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing issues
3. Create a new issue with details

---

**Made with ❤️ for a better reading experience**

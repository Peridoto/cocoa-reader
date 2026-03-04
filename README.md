# 🥥 Coco Reader

<p align="center">
  <img src="public/icons/icon-192x192.png" alt="Coco Reader Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A modern, AI-powered read-later Progressive Web App</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#demo">Demo</a>
</p>

---

## ✨ Features

### 📱 Progressive Web App (PWA)
- **Installable** on any device (iOS, Android, Desktop)
- **Offline-first** architecture with service workers
- **Web Share Target** - share articles directly from any app
- Native app-like experience with splash screens and icons

### 🤖 AI-Powered Content Processing
- **Intelligent content extraction** using Mozilla Readability
- **AI-generated summaries** for quick article overview
- **Ethical analysis** for articles on controversial topics
- **Smart fallback mechanisms** when AI services are unavailable

### 📚 Reading Experience
- **Distraction-free reader** mode with clean typography
- **Dark/Light theme** toggle for comfortable reading
- **Favorites system** to bookmark important articles
- **Search functionality** across all saved articles
- **Auto-read tracking** to resume where you left off

### 🔄 Data Management
- **Export/Import** your article library (JSON format)
- **Batch processing** for AI enhancement of multiple articles
- **Statistics dashboard** to track your reading habits
- **Cross-device sync** via cloud database

### 🎨 Modern UI/UX
- **Responsive design** optimized for all screen sizes
- **Smooth animations** and micro-interactions
- **Accessibility-focused** implementation
- **Native-like gestures** and interactions

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** (Neon) - Serverless database

### AI & Content
- **OpenAI GPT** - AI text analysis and summaries
- **Mozilla Readability** - Content extraction
- **JSDOM** - Server-side DOM parsing

### Infrastructure
- **Vercel** - Deployment and hosting
- **Service Workers** - Offline functionality
- **Web App Manifest** - PWA configuration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (or use Neon for serverless)

### Installation

```bash
# Clone the repository
git clone https://github.com/Peridoto/cocoa-reader.git
cd cocoa-reader

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and API keys

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Environment Variables

```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."  # Optional: for AI features
```

---

## 🏗 Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── articles/      # Article CRUD operations
│   │   ├── process/       # AI content processing
│   │   └── ethics/        # Ethical analysis
│   ├── read/[id]/         # Article reader page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ArticleList.tsx    # Article management
│   ├── AddArticle.tsx     # URL input form
│   ├── ArticleReader.tsx  # Reading view
│   ├── ThemeToggle.tsx    # Dark/Light mode
│   ├── Statistics.tsx     # Reading stats
│   └── ...
├── lib/                   # Utilities
│   ├── content-extractor.ts
│   ├── ai-processor.ts
│   └── ethics-analyzer.ts
└── prisma/               # Database schema
```

### Key Design Decisions

1. **Server Components** - Leveraging Next.js 14 for optimal performance
2. **Optimistic Updates** - Immediate UI feedback for better UX
3. **Progressive Enhancement** - Works without JavaScript, enhanced with it
4. **API-First Design** - Clean separation between frontend and backend

---

## 📸 Screenshots

### Home Screen
Clean article list with search, favorites, and quick actions.

### Reader View
Distraction-free reading with AI-generated summary and ethical analysis.

### PWA Experience
Installable app with offline support and native-like experience.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Test live features
npm run test:live
```

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The app is optimized for Vercel's serverless platform with:
- Automatic HTTPS
- Edge caching
- Serverless functions
- Environment variable management

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the GPL-3.0 license

---

## 👨‍💻 Author

**Peridoto**

- GitHub: [@Peridoto](https://github.com/Peridoto)
- Support: [Buy me a coffee ☕](https://buymeacoffee.com/peridoto)

---

<p align="center">
  Made with ❤️ and 🥥
</p>

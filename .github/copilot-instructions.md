<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Cocoa Reader - Read Later App

This is a full-stack Next.js 14 read-later application that works 100% locally without external dependencies.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Article Processing**: @mozilla/readability, jsdom
- **PWA**: Service Worker, Web App Manifest
- **Testing**: Vitest

## Key Features
- Save articles from URLs and extract clean content
- Offline reading with PWA support
- Dark mode with automatic detection
- Reading progress tracking
- Search and filtering
- Clean, accessible UI

## Development Guidelines
- Use TypeScript with strict typing
- Follow React best practices with hooks
- Implement proper error handling
- Use Tailwind for styling with dark mode support
- Ensure accessibility (AA contrast, keyboard navigation)
- Write tests for critical functionality

## Database Schema
The main entity is `Article` with fields for URL, title, domain, content, reading status, and scroll progress.

## API Endpoints
- `POST /api/article` - Save new article
- `GET /api/articles` - List articles with pagination/filtering  
- `GET /api/article/[id]` - Get single article
- `PATCH /api/article/[id]` - Update article status/progress
- `DELETE /api/article/[id]` - Delete article

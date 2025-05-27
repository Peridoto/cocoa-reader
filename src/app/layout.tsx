import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PWAInstaller } from '@/components/PWAInstaller'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Coco Reader - Read Later App',
  description: 'A local read-later application that works completely offline',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Coco Reader',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9333ea' },
    { media: '(prefers-color-scheme: dark)', color: '#9333ea' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to system preference
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <PWAInstaller />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

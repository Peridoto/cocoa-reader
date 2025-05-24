import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PWAInstaller } from '@/components/PWAInstaller'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Cocoa Reader - Read Later App',
  description: 'A local read-later application that works completely offline',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cocoa Reader',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <PWAInstaller />
        {children}
      </body>
    </html>
  )
}

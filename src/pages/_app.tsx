import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PWAInstaller } from '@/components/PWAInstaller'
import { URLHandler } from '@/components/URLHandler'
import { SplashScreenHandler } from '@/components/SplashScreenHandler'
import IOSSandboxErrorHandler from '@/components/IOSSandboxErrorHandler'
import AdvancedPWAFeatures from '@/components/AdvancedPWAFeatures'
import NoSSR from '@/components/NoSSR'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Theme detection script */}
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
      
      {/* React 17 + Next.js 12 stable layout */}
      <ThemeProvider>
        <NoSSR>
          <div className="min-h-screen bg-background text-foreground">
            <PWAInstaller />
            <URLHandler />
            <SplashScreenHandler />
            <IOSSandboxErrorHandler 
              enableLogging={process.env.NODE_ENV === 'development'}
              enableAutoFix={true}
            />
            <AdvancedPWAFeatures
              enableOfflineCache={true}
              enableBackgroundSync={true}
              enablePushNotifications={false}
              enablePeriodicSync={true}
              maxCacheSize={50}
            />
            <Component {...pageProps} />
          </div>
        </NoSSR>
      </ThemeProvider>
    </>
  )
}

export default MyApp

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://quranlife.vercel.app'),
  title: 'QuranLife - Personal growth with Quran',
  description: 'A life planner that combines personal and spiritual goals with Quranic guidance. Track daily prayers, read Quran verses, and achieve your goals with Islamic wisdom.',
  keywords: ['Islam', 'Quran', 'prayer tracker', 'Islamic app', 'spiritual growth', 'personal development', 'Muslim habits', 'daily prayers', 'goal setting', 'PWA'],
  authors: [{ name: 'QuranLife Team' }],
  creator: 'QuranLife',
  publisher: 'QuranLife',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quranlife.vercel.app',
    siteName: 'QuranLife',
    title: 'QuranLife - Personal growth with Quran',
    description: 'A life planner that combines personal and spiritual goals with Quranic guidance. Track daily prayers, read Quran verses, and achieve your goals with Islamic wisdom.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QuranLife - Personal growth with Quran',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuranLife - Personal growth with Quran',
    description: 'A life planner that combines personal and spiritual goals with Quranic guidance. Track daily prayers, read Quran verses, and achieve your goals with Islamic wisdom.',
    images: ['/og-image.png'],
    creator: '@quranlife',
    site: '@quranlife',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#22c55e',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="canonical" href="https://quranlife.vercel.app" />
        
        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QuranLife" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="QuranLife" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "QuranLife",
              "description": "A life planner that combines personal and spiritual goals with Quranic guidance. Track daily prayers, read Quran verses, and achieve your goals with Islamic wisdom.",
              "url": "https://quranlife.vercel.app",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "QuranLife Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "QuranLife"
              },
              "inLanguage": "en",
              "keywords": "Islam, Quran, prayer tracker, Islamic app, spiritual growth, personal development, Muslim habits, daily prayers, goal setting, PWA",
                             "screenshot": "https://quranlife.vercel.app/og-image.png",
              "softwareVersion": "1.0.0",
              "releaseNotes": "Initial release with habit tracking, goal setting, and daily Quranic guidance features."
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('QuranLife SW registered successfully:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('QuranLife SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
        
        <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          {/* Header - Desktop Only */}
          <header className="hidden md:block bg-gradient-to-r from-green-50 to-blue-50 shadow-sm border-b border-green-100">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">QL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      QuranLife
                    </span>
                  </div>
                </Link>
                
                  <nav className="flex space-x-8">
                    <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                      Dashboard
                    </Link>
                    <Link href="/settings" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                      Settings
                    </Link>
                  </nav>
              </div>
            </div>
          </header>

          {/* Mobile Top Navigation */}
          <nav className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center mb-3">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">QL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      QuranLife
                    </span>
                  </div>
                </Link>
              </div>
              
              {/* Mobile Navigation */}
                <div className="flex justify-around">
                  <Link href="/" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-green-600 transition-colors" aria-label="Go to Dashboard">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-xs">Dashboard</span>
                  </Link>
                  <Link href="/settings" className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-green-600 transition-colors" aria-label="Go to Settings">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">Settings</span>
                  </Link>
                </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="hidden md:block bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-100 mt-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand Section */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">QL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">QuranLife</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A life planner that combines personal and spiritual goals with Quranic guidance.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Quick Links</h4>
                    <div className="space-y-2">
                      <Link href="/" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/settings" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                        Settings
                      </Link>
                    </div>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Legal</h4>
                  <div className="space-y-2">
                    <Link href="/privacy" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="block text-sm text-gray-600 hover:text-green-600 transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-green-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>© {new Date().getFullYear()} QuranLife.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <a 
                    href="https://github.com/KarimOsmanGH/QuranLife" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </ErrorBoundary>
      </body>
    </html>
  )
} 
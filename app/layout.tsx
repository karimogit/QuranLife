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
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900`}>
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
        
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <ErrorBoundary>
        <div className="relative min-h-screen flex flex-col">
          {/* Header - Desktop Only */}
          <header className="hidden md:block bg-white/5 backdrop-blur-sm border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">QL</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    QuranLife
                  </span>
                </Link>
                
                <nav className="flex space-x-8">
                  <Link href="/" className="text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    Home
                  </Link>
                  <Link href="/about" className="text-white/70 hover:text-emerald-400 transition-colors font-medium">
                    About
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Mobile Top Navigation */}
          <nav className="md:hidden bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center mb-3">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">QL</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    QuranLife
                  </span>
                </Link>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex justify-around">
                <Link href="/" className="flex flex-col items-center py-2 px-3 text-white/60 hover:text-emerald-400 transition-colors" aria-label="Go to Home">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs">Home</span>
                </Link>
                <Link href="/about" className="flex flex-col items-center py-2 px-3 text-white/60 hover:text-emerald-400 transition-colors" aria-label="Go to About">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">About</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
        </ErrorBoundary>
      </body>
    </html>
  )
} 
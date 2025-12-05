import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found - QuranLife',
  description: 'The page you are looking for could not be found. Return to your spiritual journey with QuranLife.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-white/80 mb-4">Page Not Found</h2>
          <p className="text-white/60 mb-6">
            The page you are looking for could not be found. Perhaps it's time to return to your spiritual journey.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <p className="text-sm text-white/80 italic mb-2">
            "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."
          </p>
          <p className="text-xs text-white/50">Quran 65:3</p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full py-3 px-6 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 active:bg-emerald-400 transition-colors font-medium touch-manipulation"
            style={{ minHeight: '48px' }}
          >
            Return to Home
          </Link>
          <div className="flex gap-3">
            <Link 
              href="/about"
              className="flex-1 py-3 px-4 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 active:bg-white/20 transition-colors text-sm border border-white/20 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              About
            </Link>
          </div>
        </div>

        <p className="text-xs text-white/40 mt-8">
          May Allah guide you back to the right path 🤲
        </p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you are looking for could not be found. Perhaps it's time to return to your spiritual journey.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
          <p className="text-sm text-gray-700 italic mb-2">
            "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."
          </p>
          <p className="text-xs text-gray-500">Quran 65:3</p>
        </div>

          <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Return to Dashboard
          </Link>
          <div className="flex gap-3">
            <Link 
              href="/habits"
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              View Habits
            </Link>
              <Link 
                href="/"
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Goals Dashboard
              </Link>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          May Allah guide you back to the right path 🤲
        </p>
      </div>
    </div>
  );
} 
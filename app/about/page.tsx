'use client';

import Link from 'next/link';
import DashboardCard from '@/components/DashboardCard';
import { storage } from '@/lib/security';

export default function AboutPage() {
  const exportData = () => {
    try {
      // Get all data from localStorage
      const habits = storage.get('quranlife-habits', []);
      const goals = storage.get('quranlife-goals', []);
      
      // Create export object with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data: {
          habits,
          goals
        }
      };
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `quranlife-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully! Your file has been downloaded.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      storage.remove('quranlife-habits');
      storage.remove('quranlife-goals');
      alert('All data has been cleared. Please refresh the page.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">About QuranLife</h1>
        <p className="text-white/60">
          Personal growth with Quranic guidance.
        </p>
      </div>

      {/* App Info */}
      <DashboardCard 
        title="App Information" 
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white">QuranLife</h4>
            <p className="text-sm text-white/60">Version 1.0.0</p>
            <p className="text-sm text-white/60 mt-2">
              A life planner that combines personal and spiritual goals with Quranic guidance. Track your goals and receive relevant verses from the Quran.
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h4 className="font-medium text-white mb-2">Features</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Personal goal management</li>
              <li>• Quranic verse recommendations</li>
              <li>• Audio recitation playback</li>
              <li>• Arabic text with translations</li>
              <li>• Local data storage (privacy-first)</li>
            </ul>
          </div>

          {/* GitHub Link */}
          <div className="pt-4 border-t border-white/10">
            <a 
              href="https://github.com/nicobermudez/quranlife" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </DashboardCard>

      {/* Data Sources & Attribution */}
      <div className="mt-6">
        <DashboardCard title="📚 Data Sources & Attribution">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">AlQuran.cloud API</h4>
              <p className="text-sm text-white/70 mb-3">
                QuranLife is powered by the{' '}
                <a 
                  href="https://alquran.cloud/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  AlQuran.cloud API
                </a>{' '}
                - a free, open-source RESTful API providing access to the complete Holy Quran with multiple translations and recitations.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-3">
                <h5 className="font-medium text-emerald-300 mb-2">API Features We Use:</h5>
                <ul className="text-xs text-emerald-200/70 space-y-1 list-disc pl-4">
                  <li>Complete Quran text (all 6,236 verses) in Uthmani Arabic script</li>
                  <li>Muhammad Asad's English translation</li>
                  <li>Intelligent verse search capabilities</li>
                  <li>Real-time access to authentic Quranic content</li>
                  <li>Free and open for educational/religious purposes</li>
                </ul>
              </div>
            </div>
          
            <div>
              <h4 className="font-semibold text-white mb-2">Our Enhancement</h4>
              <ul className="text-sm text-white/70 space-y-1 list-disc pl-5">
                <li>Intelligent verse recommendations based on personal goals</li>
                <li>Thematic organization for practical spiritual guidance</li>
                <li>Enhanced practical guidance and dua recommendations</li>
                <li>Smart caching for improved performance and reliability</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Translation Source</h4>
              <p className="text-sm text-white/70">
                English translations are from <strong className="text-white">Muhammad Asad's "The Message of the Qur'an"</strong>, 
                known for its scholarly approach and comprehensive commentary.
              </p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-xs text-emerald-200/80">
                <strong className="text-emerald-300">For Comprehensive Quranic Study:</strong> Visit{' '}
                <a 
                  href="https://quran.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Quran.com
                </a>
                {' '}or{' '}
                <a 
                  href="https://alquran.cloud/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  AlQuran.cloud
                </a>
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Data Management */}
      <div className="mt-6">
        <DashboardCard 
          title="Data Management" 
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white">Local Storage</h4>
              <p className="text-sm text-white/60 mt-1">
                Your data is stored locally in your browser. No data is sent to external servers.
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div>
                <button
                  onClick={exportData}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 active:bg-blue-400 transition-colors text-sm font-medium touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Export Data
                </button>
                <p className="text-xs text-white/40 mt-2">
                  Download all your goals and progress as a JSON file for backup or transfer.
                </p>
              </div>
              
              <div>
                <button
                  onClick={clearAllData}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-400 active:bg-red-400 transition-colors text-sm font-medium touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Clear All Data
                </button>
                <p className="text-xs text-white/40 mt-2">
                  This will remove all your goals and progress. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Legal Links */}
      <div className="mt-6">
        <DashboardCard 
          title="Legal" 
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          <div className="space-y-3">
            <Link 
              href="/privacy" 
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-white font-medium">Privacy Policy</span>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href="/terms" 
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-white font-medium">Terms of Service</span>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </DashboardCard>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center">
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} QuranLife. All rights reserved.
        </p>
      </div>
    </div>
  );
}

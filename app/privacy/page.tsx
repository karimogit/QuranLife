import type { Metadata } from 'next'
import DashboardCard from '@/components/DashboardCard'

export const metadata: Metadata = {
  title: 'Privacy Policy - QuranLife',
  description: 'Privacy Policy and data protection practices for QuranLife app.',
  openGraph: {
    title: 'Privacy Policy - QuranLife',
    description: 'Privacy Policy and data protection practices for QuranLife app.',
    url: 'https://quranlife.vercel.app/privacy',
  },
  twitter: {
    title: 'Privacy Policy - QuranLife',
    description: 'Privacy Policy and data protection practices for QuranLife app.',
  },
}

export default function PrivacyPage() {
  return (
    <div className="py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/60">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Our Privacy Commitment">
            <div className="space-y-4 text-white/70">
              <p>
                QuranLife is designed with your privacy as a fundamental right. We believe that your spiritual 
                journey and personal development data should remain private and under your complete control.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="font-medium text-emerald-300">
                  🔒 Privacy Guarantee: We do not collect, store, or transmit any of your personal data.
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="1. Information We Do NOT Collect">
            <div className="space-y-4 text-white/70">
              <p>QuranLife does NOT collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (name, email, phone)</li>
                <li>Prayer tracking data</li>
                <li>Personal goals and habits</li>
                <li>Quran reading progress</li>
                <li>Location data</li>
                <li>Device information</li>
                <li>Usage analytics</li>
                <li>Cookies or tracking data</li>
                <li>Any other personal information</li>
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="2. Local Data Storage">
            <div className="space-y-4 text-white/70">
              <p>
                All your data is stored locally on your device using browser localStorage:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Habit Tracking:</strong> Prayer completion, Quran reading, custom habits</li>
                <li><strong className="text-white">Personal Goals:</strong> Your goals, categories, and progress</li>
                <li><strong className="text-white">App Settings:</strong> Your preferences and configurations</li>
              </ul>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 font-medium">
                  💡 This means your data never leaves your device and is completely private to you.
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="3. Data Security">
            <div className="space-y-4 text-white/70">
              <p>We implement several security measures:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">HTTPS:</strong> All app communications use secure SSL encryption</li>
                <li><strong className="text-white">Content Security Policy:</strong> Protects against malicious scripts</li>
                <li><strong className="text-white">No Third-Party Tracking:</strong> No analytics, ads, or tracking services</li>
                <li><strong className="text-white">Secure Local Storage:</strong> Data validation and sanitization</li>
                <li><strong className="text-white">Regular Security Audits:</strong> We monitor for vulnerabilities</li>
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="4. Islamic Content">
            <div className="space-y-4 text-white/70">
              <p>
                Our Islamic content handling:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quranic verses are served from local JSON files</li>
                <li>No tracking of which verses you read or how often</li>
                <li>Islamic guidance is provided without monitoring your usage</li>
                <li>Your spiritual journey remains completely private</li>
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="5. Third-Party Services">
            <div className="space-y-4 text-white/70">
              <p>QuranLife uses minimal third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Vercel (Hosting):</strong> For app delivery, no personal data transmitted</li>
                <li><strong className="text-white">Google Fonts:</strong> For typography, loaded securely</li>
                <li><strong className="text-white">No Analytics:</strong> We do not use Google Analytics or similar services</li>
                <li><strong className="text-white">No Social Media Tracking:</strong> No Facebook Pixel, Twitter tracking, etc.</li>
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="6. Data Control and Portability">
            <div className="space-y-4 text-white/70">
              <p>You have complete control over your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Export:</strong> Download all your data as a JSON file through the Settings page</li>
                <li><strong className="text-white">Access:</strong> All your data is stored locally in your browser and belongs to you</li>
                <li><strong className="text-white">Delete:</strong> Clear all data anytime through the Settings page</li>
                <li><strong className="text-white">Backup:</strong> Your browser automatically saves your data locally</li>
                <li><strong className="text-white">Transfer:</strong> Data stays with your browser/device and moves with you</li>
              </ul>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-300 text-sm">
                  ✅ <strong>Export Feature:</strong> You can now export all your data (habits, goals, progress) 
                  as a JSON file from the Settings page. This allows you to backup your data or transfer it 
                  to another device.
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="7. Children's Privacy">
            <div className="text-white/70">
              <p>
                QuranLife is safe for users of all ages. Since we don't collect any personal information, 
                there are no special privacy concerns for children. Parents can be confident that their 
                children's data remains completely private when using the app.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard title="8. International Users">
            <div className="space-y-4 text-white/70">
              <p>
                Our privacy-first approach means compliance with major privacy regulations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">GDPR (Europe):</strong> No personal data collection = automatic compliance</li>
                <li><strong className="text-white">CCPA (California):</strong> No personal data to sell or share</li>
                <li><strong className="text-white">Other Jurisdictions:</strong> Privacy-by-design architecture</li>
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="9. Changes to Privacy Policy">
            <div className="text-white/70">
              <p>
                Any changes to this Privacy Policy will be posted on this page. Since we don't collect 
                contact information, we cannot notify you directly. We recommend checking this page 
                periodically for updates.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard title="10. Islamic Privacy Principles">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
              <p className="font-medium text-white mb-2">
                🤲 "O you who believe! Avoid much suspicion, indeed some suspicions are sins."
              </p>
              <p className="text-sm text-white/60 italic mb-3">
                — Quran 49:12
              </p>
              <p className="text-sm text-white/60">
                Islam emphasizes the importance of privacy and avoiding suspicion. QuranLife honors these 
                principles by ensuring your spiritual and personal data remains completely private.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}

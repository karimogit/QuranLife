import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - QuranLife',
  description: 'Learn about QuranLife, manage your data, and find links to our privacy policy and terms of service.',
  openGraph: {
    title: 'About - QuranLife',
    description: 'Learn about QuranLife, manage your data, and find links to our privacy policy and terms of service.',
    url: 'https://quranlife.vercel.app/about',
    images: ['/og-image.png'],
  },
  twitter: {
    title: 'About - QuranLife',
    description: 'Learn about QuranLife, manage your data, and find links to our privacy policy and terms of service.',
    images: ['/og-image.png'],
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

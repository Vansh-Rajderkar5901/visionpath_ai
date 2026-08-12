import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'VisionPath AI - Navigate Without Limits',
  description: 'AI-powered indoor navigation and accessibility platform for everyone. Voice guidance, OCR reader, object detection, and emergency assistance.',
  keywords: ['accessibility', 'navigation', 'AI', 'indoor navigation', 'voice guidance', 'OCR', 'visually impaired'],
  authors: [{ name: 'VisionPath AI' }],
  openGraph: {
    title: 'VisionPath AI - Navigate Without Limits',
    description: 'AI-powered indoor navigation and accessibility platform',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Leaflet's stylesheet is imported by components/map/CampusMap so it
            ships from the local package instead of a CDN. */}
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

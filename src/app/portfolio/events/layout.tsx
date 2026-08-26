import type { Metadata } from 'next';
import { getServiceById } from '@/data/portfolioData';
import JsonLd from '@/components/portfolio/seo/JsonLd';

const events = getServiceById('events');

const pageDescription =
  'Event coverage from a studio with one event filmed and zero missed. The first 5 events get the founder price.';

export const metadata: Metadata = {
  title: 'Event Coverage | CAPTURA Production',
  description: pageDescription,
  keywords: [
    'event videography Malaysia', 'conference video', 'event coverage Kuala Lumpur',
    'concert videography', 'gala video', 'event aftermovie',
  ],
  alternates: {
    canonical: '/portfolio/events',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/events',
    title: 'Event Coverage | CAPTURA',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: events.items[0].thumbnail,
        width: 1200,
        height: 630,
        alt: 'CAPTURA event coverage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Coverage | CAPTURA',
    description: pageDescription,
    images: [events.items[0].thumbnail],
  },
};

// Structured data: the one event film so far
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGallery',
  name: 'CAPTURA Event Coverage',
  description: pageDescription,
  publisher: {
    '@type': 'Organization',
    name: 'CAPTURA',
    url: 'https://capturarentals.com',
  },
  video: events.items.slice(0, 1).map((item) => ({
    '@type': 'VideoObject',
    name: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnail,
    contentUrl: item.videoUrl,
    uploadDate: `${item.year ?? '2025'}-01-01`,
    author: {
      '@type': 'Organization',
      name: 'CAPTURA',
    },
  })),
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://capturarentals.com' },
            { '@type': 'ListItem', position: 2, name: 'Portfolio', item: 'https://capturarentals.com/portfolio' },
            { '@type': 'ListItem', position: 3, name: 'Events', item: 'https://capturarentals.com/portfolio/events' },
          ],
        }}
      />
      {children}
    </>
  );
}

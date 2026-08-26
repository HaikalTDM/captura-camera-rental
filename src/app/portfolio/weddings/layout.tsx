import type { Metadata } from 'next';
import { getServiceById, weddingShowreel } from '@/data/portfolioData';

const weddings = getServiceById('weddings');

const pageDescription =
  'Fun-style wedding films in Malaysia — three to four minutes of your best day, captured like a mockumentary. Showreel, launch packages, kind words and FAQs.';

export const metadata: Metadata = {
  title: 'Wedding Films — CAPTURA Production',
  description: pageDescription,
  alternates: {
    canonical: '/portfolio/weddings',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/weddings',
    title: 'Wedding Films — CAPTURA',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: weddings.items[0].thumbnail,
        width: 1200,
        height: 630,
        alt: 'CAPTURA wedding films',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding Films — CAPTURA',
    description: pageDescription,
    images: [weddings.items[0].thumbnail],
  },
};

// Structured data: VideoGallery of wedding films + the showreel
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGallery',
  name: 'CAPTURA Wedding Films',
  description: pageDescription,
  publisher: {
    '@type': 'Organization',
    name: 'CAPTURA',
    url: 'https://capturarentals.com',
  },
  video: [weddingShowreel, ...weddings.items].map((item) => ({
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

export default function WeddingFilmsLayout({
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
      {children}
    </>
  );
}

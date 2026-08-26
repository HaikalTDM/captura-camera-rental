import type { Metadata } from 'next';
import { portfolioServices } from '@/data/portfolioData';

const pageDescription =
  'From intimate weddings to corporate campaigns. Explore Captura\u2019s production portfolio across wedding films, corporate & brand videos, event coverage and content creation in Malaysia.';

export const metadata: Metadata = {
  title: 'Portfolio | CAPTURA Production Services',
  description: pageDescription,
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio',
    title: 'CAPTURA Production Portfolio | Wedding Films, Corporate & Events',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: '/images/captura_logo_big.png',
        width: 1200,
        height: 630,
        alt: 'CAPTURA Production Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAPTURA Production Portfolio',
    description: pageDescription,
    images: ['/images/captura_logo_big.png'],
  },
};

// Structured data: VideoGallery of the showcased work
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGallery',
  name: 'CAPTURA Production Portfolio',
  description: pageDescription,
  publisher: {
    '@type': 'Organization',
    name: 'CAPTURA',
    url: 'https://capturarentals.com',
  },
  video: portfolioServices.flatMap((service) =>
    service.items.map((item) => ({
      '@type': 'VideoObject',
      name: item.title,
      description: item.description,
      thumbnailUrl: item.thumbnail,
      contentUrl: item.videoUrl,
      uploadDate: '2025-01-01',
      author: {
        '@type': 'Organization',
        name: 'CAPTURA',
      },
    }))
  ),
};

export default function PortfolioLayout({
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

import type { Metadata } from 'next';
import { getServiceById, weddingShowreel, weddingFaqs } from '@/data/portfolioData';
import JsonLd from '@/components/portfolio/seo/JsonLd';

const weddings = getServiceById('weddings');

const pageDescription =
  'Fun-style wedding films in Malaysia. Three to four minutes of your best day, captured like a mockumentary. Showreel, launch packages, kind words and FAQs.';

export const metadata: Metadata = {
  title: 'Wedding Films | CAPTURA Production',
  description: pageDescription,
  keywords: [
    'wedding videography', 'wedding video Malaysia', 'wedding videographer Kuala Lumpur',
    'fun wedding film', 'highlight video wedding', 'wedding cinematography',
  ],
  alternates: {
    canonical: '/portfolio/weddings',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/weddings',
    title: 'Wedding Films | CAPTURA',
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
    title: 'Wedding Films | CAPTURA',
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

// Breadcrumb + FAQ rich results
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://capturarentals.com' },
    { '@type': 'ListItem', position: 2, name: 'Portfolio', item: 'https://capturarentals.com/portfolio' },
    { '@type': 'ListItem', position: 3, name: 'Wedding Films', item: 'https://capturarentals.com/portfolio/weddings' },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: weddingFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
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
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={faqLd} />
      {children}
    </>
  );
}

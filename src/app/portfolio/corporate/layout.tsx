import type { Metadata } from 'next';
import JsonLd from '@/components/portfolio/seo/JsonLd';
import { getServiceById } from '@/data/portfolioData';

const corporate = getServiceById('corporate');

const pageDescription =
  'Corporate & brand videos from a studio with zero corporate videos so far and everything to prove. The first 5 brands get the founder price.';

export const metadata: Metadata = {
  title: 'Corporate & Brand Videos | CAPTURA Production',
  description: pageDescription,
  keywords: [
    'corporate video Malaysia', 'brand video Kuala Lumpur', 'product launch video',
    'corporate videography', 'company profile video', 'social media campaign video',
  ],
  alternates: {
    canonical: '/portfolio/corporate',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/corporate',
    title: 'Corporate & Brand Videos | CAPTURA',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: corporate.items[0].thumbnail,
        width: 1200,
        height: 630,
        alt: 'CAPTURA corporate & brand videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corporate & Brand Videos | CAPTURA',
    description: pageDescription,
    images: [corporate.items[0].thumbnail],
  },
};

export default function CorporateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://capturarentals.com' },
            { '@type': 'ListItem', position: 2, name: 'Portfolio', item: 'https://capturarentals.com/portfolio' },
            { '@type': 'ListItem', position: 3, name: 'Corporate & Brand', item: 'https://capturarentals.com/portfolio/corporate' },
          ],
        }}
      />
      {children}
    </>
  );
}

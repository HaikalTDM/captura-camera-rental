import type { Metadata } from 'next';
import JsonLd from '@/components/portfolio/seo/JsonLd';
import { getServiceById } from '@/data/portfolioData';

const content = getServiceById('content');

const pageDescription =
  'Content creation from a studio whose TikTok is their portfolio. The first 5 brands get the founder rate.';

export const metadata: Metadata = {
  title: 'Content Creation | CAPTURA Production',
  description: pageDescription,
  keywords: [
    'content creation Malaysia', 'social media content', 'video marketing TikTok',
    'reels editing', 'content creator', 'product showcase video',
  ],
  alternates: {
    canonical: '/portfolio/content',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/content',
    title: 'Content Creation | CAPTURA',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: content.items[0].thumbnail,
        width: 1200,
        height: 630,
        alt: 'CAPTURA content creation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Creation | CAPTURA',
    description: pageDescription,
    images: [content.items[0].thumbnail],
  },
};

export default function ContentLayout({
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
            { '@type': 'ListItem', position: 3, name: 'Content Creation', item: 'https://capturarentals.com/portfolio/content' },
          ],
        }}
      />
      {children}
    </>
  );
}

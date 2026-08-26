import type { Metadata } from 'next';
import JsonLd from '@/components/portfolio/seo/JsonLd';
import { getServiceById } from '@/data/portfolioData';

const graduation = getServiceById('graduation');

const pageDescription =
  'Graduation photography from a studio with zero graduations shot so far and all the hype. The first 5 grads get the founder price.';

export const metadata: Metadata = {
  title: 'Graduation Photography | CAPTURA',
  description: pageDescription,
  keywords: [
    'graduation photography Malaysia', 'convocation photographer', 'pre convo shoot',
    'graduation photos Kuala Lumpur', 'convocation picture', 'graduation portrait',
  ],
  alternates: {
    canonical: '/portfolio/graduation',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com/portfolio/graduation',
    title: 'Graduation Photography | CAPTURA',
    description: pageDescription,
    siteName: 'CAPTURA',
    images: [
      {
        url: graduation.items[0].thumbnail,
        width: 1200,
        height: 630,
        alt: 'CAPTURA graduation photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Graduation Photography | CAPTURA',
    description: pageDescription,
    images: [graduation.items[0].thumbnail],
  },
};

export default function GraduationLayout({
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
            { '@type': 'ListItem', position: 3, name: 'Graduation Photography', item: 'https://capturarentals.com/portfolio/graduation' },
          ],
        }}
      />
      {children}
    </>
  );
}

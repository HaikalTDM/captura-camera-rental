import type { Metadata } from 'next';

const pageDescription =
  'Corporate & brand videos from a studio with zero corporate videos so far and everything to prove. The first 5 brands get the founder price.';

export const metadata: Metadata = {
  title: 'Corporate & Brand Videos | CAPTURA Production',
  description: pageDescription,
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
        url: '/images/captura_logo_big.png',
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
    images: ['/images/captura_logo_big.png'],
  },
};

export default function CorporateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

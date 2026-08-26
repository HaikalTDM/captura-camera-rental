import type { Metadata } from 'next';

const pageDescription =
  'Graduation photography from a studio with zero graduations shot so far and all the hype. The first 5 grads get the founder price.';

export const metadata: Metadata = {
  title: 'Graduation Photography | CAPTURA',
  description: pageDescription,
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
        url: '/images/captura_logo_big.png',
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
    images: ['/images/captura_logo_big.png'],
  },
};

export default function GraduationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

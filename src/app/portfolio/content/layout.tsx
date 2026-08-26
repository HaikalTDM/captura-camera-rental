import type { Metadata } from 'next';

const pageDescription =
  'Content creation from a studio whose TikTok is their portfolio. The first 5 brands get the founder rate.';

export const metadata: Metadata = {
  title: 'Content Creation | CAPTURA Production',
  description: pageDescription,
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
        url: '/images/captura_logo_big.png',
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
    images: ['/images/captura_logo_big.png'],
  },
};

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

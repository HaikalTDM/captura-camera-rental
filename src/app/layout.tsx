import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../styles/terms-modal.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import DOMSafetyPatch from "@/components/DOMSafetyPatch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CAPTURA - Premium Camera Rental KL",
  description: "Rent professional DJI cameras in Kuala Lumpur. Osmo Pocket 3 and Action 5 Pro available for daily rental. Book now!",
  applicationName: "CAPTURA",
  keywords: ["camera rental", "DJI", "Osmo Pocket 3", "Action 5 Pro", "Kuala Lumpur", "KL", "professional camera", "rental"],
  authors: [{ name: "CAPTURA" }],
  creator: "CAPTURA",
  publisher: "CAPTURA",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: '/images/captura_logo_big.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/captura_logo_big.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/captura_logo_big.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CAPTURA',
    startupImage: [
      {
        url: '/images/captura_logo_big.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://capturarentals.com',
    title: 'CAPTURA - Premium Camera Rental KL',
    description: 'Rent professional DJI cameras in Kuala Lumpur. Osmo Pocket 3 and Action 5 Pro available.',
    siteName: 'CAPTURA',
    images: [
      {
        url: '/images/captura_logo_big.png',
        width: 1200,
        height: 630,
        alt: 'CAPTURA Camera Rental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAPTURA - Premium Camera Rental KL',
    description: 'Rent professional DJI cameras in Kuala Lumpur',
    images: ['/images/captura_logo_big.png'],
  },
  metadataBase: new URL('https://capturarentals.com'),
};

// Separate viewport export (Next.js 14+ requirement)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <ErrorBoundary>
          <DOMSafetyPatch />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

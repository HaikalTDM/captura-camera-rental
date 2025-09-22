import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/terms-modal.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAPTURA - Premium Camera Rental",
  description: "Rent professional cameras for your creative projects. Osmo Pocket 3 and Action 5 Pro available for daily rental.",
  icons: {
    icon: [
      { url: '/images/captura_icon.ico', sizes: 'any' },
      { url: '/images/captura_icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/images/captura_icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

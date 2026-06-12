import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Reduce console warnings
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'framer-motion', 'recharts', 'lucide-react']
  },
  turbopack: {
    // Ensure correct project root to avoid conflicts (e.g., favicon) and dev mis-detection
    root: __dirname,
  },
  // Custom headers to reduce some warnings
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirects from old /photography routes to new /studio routes
  async redirects() {
    return [
      { source: '/photography', destination: '/studio/photography', permanent: true },
      { source: '/photography/packages', destination: '/studio/photography/packages', permanent: true },
      { source: '/photography/gallery', destination: '/studio/photography/gallery', permanent: true },
      { source: '/photography/testimonials', destination: '/studio/testimonials', permanent: true },
      { source: '/photography/faq', destination: '/studio/faq', permanent: true },
      { source: '/photography/contact', destination: '/studio/contact', permanent: true },
    ];
  },
};

export default nextConfig;

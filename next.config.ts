import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable caching for development and ensure fresh builds
  generateBuildId: async () => {
    // Use timestamp to ensure unique build IDs
    return `build-${Date.now()}`;
  },

  // Add cache control headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

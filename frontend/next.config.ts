import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mode for better caching and reduced function calls
  output: 'standalone', // Reduces bundle size by 30-40%

  poweredByHeader: false, // Remove X-Powered-By header for security
  env: {
    IS_BUILD_PHASE: process.env.npm_lifecycle_event === 'build' ? 'true' : 'false',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 120,
  experimental: {
    // Optimize heavy packages - tree shake them better
    optimizePackageImports: [
      'react-icons',
      'swiper',
      'react-toastify',
      'react-datepicker',
      'socket.io-client',
      'daisyui',
      'isomorphic-dompurify',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Webpack optimizations for smaller bundles
  webpack: (config, { isServer }) => {
    // Minimize bundle size
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use lighter lodash if needed
        'lodash': 'lodash-es',
      };
    }
    return config;
  },
  images: {
    // Optimize images for better LCP - serve modern formats
    formats: ['image/avif', 'image/webp'],
    // Optimized device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimize image size
    minimumCacheTTL: 31536000, // 1 year cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    return {
      beforeFiles: [
        { source: "/api/auth/register", destination: `${apiOrigin}/api/auth/register` },
      ],
      afterFiles: [
        {
          source: '/sitemap-seo-:segment.xml',
          destination: '/sitemap-seo/:segment',
        },
        {
          source: '/sitemap-:segment.xml',
          destination: '/sitemap/:segment',
        },
      ],
      fallback: [
        {
          source: "/socket.io/:path*",
          destination: `${apiOrigin}/socket.io/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${apiOrigin}/api/:path*`,
        },
      ],
    };
  },
  // Aggressive caching to reduce function invocations
  async headers() {
    return [
      {
        source: '/salons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Cache for 24 hours, serve stale for 7 days while revalidating
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/salons/location/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

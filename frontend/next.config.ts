import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;

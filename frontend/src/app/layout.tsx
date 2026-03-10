// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { SocketProvider } from '@/context/SocketContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext'; // Import the new provider
import { ThemeProvider } from '@/context/ThemeContext';
import { NavigationLoadingProvider } from '@/context/NavigationLoadingContext';
import TopNav from '@/components/TopNav';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNavIcons from '@/components/MobileNavIcons';

import AuthSessionProvider from '@/components/AuthSessionProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthModalHandler from '@/components/AuthModalHandler';
import ClientInit from '@/components/ClientInit';
import { Suspense } from 'react';
// Analytics/runtime is handled by the self-hosted Hetzner deployment
import SkipToContent from '@/components/SkipToContent/SkipToContent';
import BackendStatus from '@/components/DevTools/BackendStatus';
import EmailVerificationBannerWrapper from '@/components/EmailVerificationBannerWrapper';
// Client-only components with ssr: false must be in a Client Component (Next.js 15 requirement)
import ClientComponents from '@/components/ClientComponents';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents FOUT layout shift
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#8B4513',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'),
  title: {
    default: 'Stylr SA: Book Premium Salons, Luxury Spas & Top Beauty Experts',
    template: '%s | Stylr SA - Premium Beauty & Wellness'
  },
  description: 'South Africa\'s premier destination for luxury beauty & wellness. Book appointments at top-rated premium salons, medical spas, beauty clinics & expert wellness professionals.',
  keywords: [
    // Premium Brand keywords
    'Stylr SA', 'stylrsa', 'stylrsa.co.za', 'premium beauty platform South Africa', 'luxury salon booking',
    // Premium Services
    'premium salon', 'luxury spa', 'medical spa', 'beauty clinic', 'top nail technician',
    'exclusive beauty services', 'high-end salon', 'luxury wellness', 'elite beauty professionals',
    'premium braiding salon', 'luxury nail salon', 'top makeup artist', 'premium barber',
    // Quality indicators
    'top-rated salon', 'certified beauty professionals', 'expert stylists', 'professional beauty services',
    // Locations
    'South Africa', 'Johannesburg', 'Cape Town', 'Pretoria', 'Sandton', 'Rosebank', 'Gauteng', 'Western Cape',
    // Action keywords
    'book premium salon', 'luxury beauty appointments', 'exclusive spa booking'
  ],
  authors: [{ name: 'Stylr SA Team', url: 'https://www.stylrsa.co.za' }],
  creator: 'Stylr SA',
  publisher: 'Stylr SA',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'MdWcHRFxz3-UMrPPAxgFGXfqCoTTAzPRZ7a9igeRHRk',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stylr SA',
  },
  openGraph: {
    title: 'Stylr SA - Book Hair, Nails, Makeup & Beauty Services Online',
    description: 'Find and book beauty services across South Africa. Top-rated salons, braiders, nail techs, makeup artists, hair stylists & spas in one platform.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za',
    siteName: 'Stylr SA',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/logo-transparent.png`,
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA: Premium Beauty & Wellness Platform',
    description: 'South Africa\'s destination for luxury salons, medical spas, beauty clinics, and top wellness professionals. Experience excellence with elite service providers.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/logo-transparent.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Preload LCP hero image for faster initial paint */}
        <link
          rel="preload"
          as="image"
          href="/art_one.webp"
          fetchPriority="high"
        />
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Google Fonts preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      </head>
      <body className={inter.className} suppressHydrationWarning>
        <BackendStatus />
        <Suspense fallback={null}>
          <ClientInit />
        </Suspense>
        <SkipToContent />
        <ErrorBoundary>
          <AuthSessionProvider>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <AuthModalProvider>
                    <NavigationLoadingProvider>
                      <ScrollToTop />
                      <Suspense fallback={null}>
                        <AuthModalHandler />
                      </Suspense>
                      <div className="app-shell">
                        <TopNav />
                        <Navbar />
                        <EmailVerificationBannerWrapper />
                        <MobileNavIcons />
                        <div className="app-content">
                          <main className="main-content" id="main-content">{children}</main>
                          <Footer />
                        </div>
                      </div>
                      <ClientComponents />
                    </NavigationLoadingProvider>
                  </AuthModalProvider>
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

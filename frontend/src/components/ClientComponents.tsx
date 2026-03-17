'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load non-critical client components for better initial load performance
// These must be in a Client Component to use ssr: false
const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false });
const Analytics = dynamic(() => import('@/components/Analytics'), { ssr: false });
const ToasterClient = dynamic(() => import('@/components/ToasterClient'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('@/components/PWAInstallPrompt'), { ssr: false });
const ZoomHandler = dynamic(() => import('@/components/ZoomHandler'), { ssr: false });
const RequestTop10Button = dynamic(() => import('@/components/RequestTop10/RequestTop10Button'), { ssr: false });
const SalonMapButton = dynamic(() => import('@/components/SalonMapView/SalonMapButton'), { ssr: false });

/**
 * ClientComponents wrapper - bundles all client-only dynamic imports
 * This is necessary because Next.js 15 doesn't allow ssr: false in Server Components
 */
export default function ClientComponents() {
    return (
        <>
            <Suspense fallback={null}>
                <ToasterClient />
            </Suspense>
            <CookieBanner />
            <ZoomHandler />
            <Suspense fallback={null}>
                <Analytics />
            </Suspense>
            <PWAInstallPrompt />
            <RequestTop10Button variant="floating" />
            <SalonMapButton variant="floating" />
        </>
    );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityPageClient from './CityPageClient';
import { getCityInfo } from '@/lib/locationData';
import { buildSalonLocationMetadata } from '@/lib/seoMetadataHelpers';
import { PRIORITY_CITY_LOCATION_TARGETS } from '@/lib/prioritySeoLocations';

interface PageProps {
    params: Promise<{
        location: string;
        city: string;
    }>;
}

// ISR - pages cached for 24 hours, regenerated in background
export const dynamicParams = true;
export const revalidate = 86400; // Cache for 24 hours

// Fetch initial salons on server
async function getInitialSalons(cityName: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.stylrsa.co.za';
    try {
        const res = await fetch(`${apiUrl}/api/salons/approved?city=${encodeURIComponent(cityName)}&limit=12`, {
            next: { revalidate: 21600 }, // 6 hours
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function generateStaticParams() {
    return PRIORITY_CITY_LOCATION_TARGETS.map(({ location, city }) => ({ location, city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { location, city } = await params;
    const cityInfo = getCityInfo(location, city);

    if (!cityInfo) {
        return {
            title: 'City Not Found | Stylr SA',
            description: 'The city you are looking for could not be found.',
        };
    }

    const metadataFields = buildSalonLocationMetadata({ province: location, city });
    const canonicalUrl = `https://www.stylrsa.co.za/salons/location/${location}/${city}`;

    return {
        title: metadataFields.title,
        description: metadataFields.description,
        keywords: cityInfo.keywords.join(', '),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: metadataFields.title,
            description: metadataFields.description,
            url: canonicalUrl,
            siteName: 'Stylr SA',
            locale: 'en_ZA',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: metadataFields.title,
            description: metadataFields.description,
        },
    };
}

export default async function CityPage({ params }: PageProps) {
    const { location, city } = await params;
    const cityInfo = getCityInfo(location, city);

    if (!cityInfo) {
        notFound();
    }

    // Fetch initial data on server for faster LCP
    const initialSalons = await getInitialSalons(cityInfo.name);

    return <CityPageClient initialSalons={initialSalons} cityInfo={cityInfo} />;
}

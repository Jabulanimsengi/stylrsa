import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocationPageClient from './LocationPageClient';
import { getProvinceInfo } from '@/lib/locationData';

interface PageProps {
    params: Promise<{
        location: string;
    }>;
}

// ISR - pages cached for 24 hours, regenerated in background
export const dynamicParams = true;
export const revalidate = 86400; // Cache for 24 hours

// Fetch initial salons on server for better LCP (only at build time)
async function getInitialSalons(provinceName: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.stylrsa.co.za';
    try {
        const res = await fetch(`${apiUrl}/api/salons/approved?province=${encodeURIComponent(provinceName)}&limit=12`, {
            next: { revalidate: 21600 }, // 6 hours
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Pre-build province pages (All 9 Provinces)
const PROVINCES = [
    'gauteng',
    'western-cape',
    'north-west',
    'kwazulu-natal',
    'eastern-cape',
    'free-state',
    'mpumalanga',
    'limpopo',
    'northern-cape'
];

export async function generateStaticParams() {
    return PROVINCES.map(location => ({ location }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { location } = await params;
    const provinceInfo = getProvinceInfo(location);

    if (!provinceInfo) {
        return {
            title: 'Location Not Found | Stylr SA',
            description: 'The location you are looking for could not be found.',
        };
    }

    const title = `Best Hair Salons & Spas in ${provinceInfo.name} | Stylr SA`;
    const description = provinceInfo.description;
    const canonicalUrl = `https://www.stylrsa.co.za/salons/location/${location}`;

    return {
        title,
        description,
        keywords: provinceInfo.keywords.join(', '),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Stylr SA',
            locale: 'en_ZA',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function LocationPage({ params }: PageProps) {
    const { location } = await params;
    const provinceInfo = getProvinceInfo(location);

    if (!provinceInfo) {
        notFound();
    }

    // Fetch initial data on server for faster LCP
    const initialSalons = await getInitialSalons(provinceInfo.name);

    return <LocationPageClient initialSalons={initialSalons} provinceInfo={provinceInfo} />;
}

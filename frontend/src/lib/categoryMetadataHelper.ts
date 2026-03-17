import type { Metadata } from 'next';

interface CategoryMetadataParams {
    category?: string;
    service?: string;
    city?: string;
    province?: string;
}

// Category display names and descriptions
const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
    'salon': { name: 'Hair Salons', description: 'premium hair salons offering cuts, styling, color, and treatments' },
    'spa': { name: 'Spas', description: 'luxury spas and medical spas offering wellness treatments, massages, and beauty services' },
    'barber': { name: 'Barbershops', description: 'expert barbers specializing in men\'s cuts, shaves, and grooming' },
    'nail-salon': { name: 'Nail Salons', description: 'professional nail technicians for manicures, pedicures, and nail art' },
    'beauty-salon': { name: 'Beauty Salons', description: 'full-service beauty salons for hair, makeup, and skincare' },
    'braiding': { name: 'Braiding Salons', description: 'specialist braiding salons for African braids, cornrows, and protective styles' },
    'makeup': { name: 'Makeup Artists', description: 'professional makeup artists for events, weddings, and special occasions' },
};

// Service display names
const SERVICE_INFO: Record<string, string> = {
    'haircut': 'Haircuts',
    'hair-color': 'Hair Coloring',
    'braids': 'Braids & Plaiting',
    'weave': 'Weave Installation',
    'locs': 'Locs & Dreadlocks',
    'manicure': 'Manicures',
    'pedicure': 'Pedicures',
    'massage': 'Massages',
    'facial': 'Facials',
    'waxing': 'Waxing Services',
    'threading': 'Threading',
    'botox': 'Botox Treatments',
    'makeup': 'Makeup Services',
    'eyelashes': 'Eyelash Extensions',
};

/**
 * Generate SEO-optimized metadata for category/service/location combinations
 */
export function generateCategoryMetadata(params: CategoryMetadataParams): Metadata {
    const { category, service, city, province } = params;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

    // Build title components
    const titleParts: string[] = [];
    const descriptionParts: string[] = [];
    const keywords: string[] = [];

    // Category or Service as primary focus
    if (category && CATEGORY_INFO[category]) {
        const catInfo = CATEGORY_INFO[category];
        titleParts.push(`Best ${catInfo.name}`);
        descriptionParts.push(`Discover top-rated ${catInfo.description}`);
        keywords.push(catInfo.name.toLowerCase(), `${category} near me`);
    } else if (service && SERVICE_INFO[service]) {
        const serviceName = SERVICE_INFO[service];
        titleParts.push(`Best ${serviceName}`);
        descriptionParts.push(`Find professional ${serviceName.toLowerCase()} services`);
        keywords.push(serviceName.toLowerCase(), `${service} near me`);
    } else {
        titleParts.push('Top Salons & Beauty Professionals');
        descriptionParts.push('Explore top-rated salons and beauty professionals');
    }

    // Location
    if (city) {
        const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
        titleParts.push(`in ${cityName}`);
        descriptionParts.push(`in ${cityName}, South Africa`);
        keywords.push(`${cityName}`, `${cityName} beauty services`);
    } else if (province) {
        const provinceName = province.charAt(0).toUpperCase() + province.slice(1).replace(/-/g, ' ');
        titleParts.push(`in ${provinceName}`);
        descriptionParts.push(`in ${provinceName}, South Africa`);
        keywords.push(`${provinceName}`, `${provinceName} beauty services`);
    }

    // Build final strings
    const title = `${titleParts.join(' ')} | Stylr SA`;
    const description = `${descriptionParts.join(' ')}. Book appointments online with verified professionals. Compare prices, reviews, and availability.`;

    // Add general and high-intent keywords
    keywords.push(
        'book salon appointment',
        'beauty services South Africa',
        'Stylr SA',
        'walk in salons',
        'salon prices',
        'affordable salons',
        'best salons near me',
        'cheap hair salon'
    );

    // Add specific intent keywords based on context
    if (city || province) {
        const loc = city || province;
        keywords.push(
            `walk in salon ${loc}`,
            `salon prices ${loc}`,
            `best hair salon ${loc} reviews`
        );
    }

    // Filtered /salons pages are useful for users, but dedicated SEO landing pages
    // should carry indexation for service/location discovery.
    const canonicalUrl = `${siteUrl}/salons`;

    return {
        title,
        description,
        keywords: keywords.join(', '),
        robots: {
            index: false,
            follow: true,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Stylr SA',
            type: 'website',
            locale: 'en_ZA',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

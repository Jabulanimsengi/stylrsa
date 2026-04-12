// frontend/src/app/salons/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import SalonsPageClient from './SalonsPageClient';
import { generateCategoryMetadata } from '@/lib/categoryMetadataHelper';

type Props = {
  searchParams: Promise<{
    category?: string;
    service?: string;
    city?: string;
    province?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  if (!params.category && !params.service && !params.city && !params.province) {
    const title = 'Salons in South Africa | Stylr SA';
    const description = 'Browse verified salons, spas, and beauty professionals across South Africa. Compare services, reviews, pricing, and booking availability on Stylr SA.';

    return {
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/salons`,
      },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/salons`,
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

  return generateCategoryMetadata({
    category: params.category,
    service: params.service,
    city: params.city,
    province: params.province,
  });
}

export default function SalonsPage() {
  return (
    <Suspense fallback={null}>
      <SalonsPageClient />
    </Suspense>
  );
}

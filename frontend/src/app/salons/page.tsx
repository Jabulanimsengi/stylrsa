// frontend/src/app/salons/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SalonsPageSkeleton } from '@/components/Skeleton/ServicesPageSkeleton';
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

  // If no filter params, use default metadata from layout
  if (!params.category && !params.service && !params.city && !params.province) {
    return {};
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
    <Suspense fallback={<SalonsPageSkeleton />}>
      <SalonsPageClient />
    </Suspense>
  );
}

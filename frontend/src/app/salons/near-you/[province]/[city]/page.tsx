import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SalonCityNearYouClient from './SalonCityNearYouClient';
import { getAllProvinceSlugs } from '@/lib/nearYouContent';
import { getCitiesByProvince } from '@/lib/locationData';
import styles from '@/app/salons/SalonsPage.module.css';

// ISR - pages cached for 24 hours
export const dynamicParams = true;
export const revalidate = 86400; // Cache for 24 hours

type Props = {
  params: Promise<{ province: string; city: string }>;
};

// No pre-built pages - all generated on-demand
export async function generateStaticParams() {
  return [];
}

export default async function SalonCityNearYouPage({ params }: Props) {
  const { province, city } = await params;

  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Salons...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <SalonCityNearYouClient provinceSlug={province} citySlug={city} />
    </Suspense>
  );
}


'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '../SalonsPage.module.css';
import Link from 'next/link';
import { PROVINCES } from '@/lib/locationData';

function NearMeContent() {
  const router = useRouter();
  const { coordinates, locationName, isLoading, requestLocation } = useGeolocation(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (!hasRequested) {
      requestLocation();
      setHasRequested(true);
    }
  }, [hasRequested, requestLocation]);

  useEffect(() => {
    if (coordinates && locationName) {
      // Redirect to location-specific page with coordinates
      const province = locationName.province?.toLowerCase().replace(/\s+/g, '-');
      const city = locationName.city?.toLowerCase().replace(/\s+/g, '-');

      if (province) {
        // If we have city, use province page with query params for filtering
        router.push(`/salons/location/${province}?city=${city || ''}&lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      } else {
        // Fallback to general salons page with coordinates
        router.push(`/salons?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
      }
    }
  }, [coordinates, locationName, router]);

  // Get popular cities for static links
  const popularCities = Object.values(PROVINCES).flatMap(p => p.cities).slice(0, 12);

  return (
    <div className={styles.container}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        {isLoading ? (
          <>
            <h1 className={styles.title}>Finding Salons Near You...</h1>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Please allow location access to find nearby salons
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Location Access Required</h1>
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '1.1rem' }}>
              We need your location to show you salons near you.
            </p>
            <button
              onClick={requestLocation}
              style={{
                marginTop: '2rem',
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Enable Location
            </button>
          </>
        )}

        {/* Static Content for SEO */}
        <div style={{ marginTop: '4rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            Popular Locations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/salons/location/${city.province.toLowerCase().replace(/\s+/g, '-')}/${city.slug}`}
                style={{ color: '#666', textDecoration: 'none', fontSize: '0.95rem' }}
                className="hover:text-primary"
              >
                Salons in {city.name}
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/salons" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              View All Locations &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NearMeClient() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NearMeContent />
    </Suspense>
  );
}

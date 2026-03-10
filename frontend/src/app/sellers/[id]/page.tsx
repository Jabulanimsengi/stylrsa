'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './SellerProfile.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { getPlaceholder } from '@/lib/placeholders';

interface SellerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  products: Product[];
}

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchSeller = useCallback(async () => {
    const sellerId = params?.id;
    if (!sellerId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/sellers/${sellerId}`);
      if (res.ok) {
        setSeller(await res.json());
      } else {
        router.replace('/products');
      }
    } finally {
      setIsLoading(false);
    }
  }, [params?.id, router]);

  useEffect(() => {
    fetchSeller();
  }, [fetchSeller]);

  const heroImages = useMemo(() => {
    if (!seller) return [getPlaceholder('ultra-wide')];
    const collected: string[] = [];
    seller.products.forEach((product) => {
      (product.images ?? []).forEach((img) => {
        if (img && !collected.includes(img)) {
          collected.push(img);
        }
      });
    });
    return collected.length > 0 ? collected : [getPlaceholder('ultra-wide')];
  }, [seller]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className={styles.errorState}>
        <h1>Seller not found</h1>
      </div>
    );
  }

  const sellerName = `${seller.firstName ?? ''} ${seller.lastName ?? ''}`.trim() || 'Seller';
  const initials = sellerName
    .split(' ')
    .map((segment) => segment.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const totalProducts = seller.products.length;
  const totalStock = seller.products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
  const establishedDate = new Date(seller.createdAt).toLocaleDateString();

  const sellerSummary = {
    id: seller.id,
    firstName: seller.firstName,
    lastName: seller.lastName,
    email: seller.email,
  };

  const enrichedProducts = seller.products.map((product) => ({
    ...product,
    seller: sellerSummary,
    sellerId: product.sellerId ?? seller.id,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroSlider}>
          <div
            className={styles.sliderWrapper}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroImages.map((image, index) => (
              <div key={`${image}-${index}`} className={styles.slide}>
                <Image
                  src={image}
                  alt={`${sellerName} showcase ${index + 1}`}
                  fill
                  className={styles.heroImage}
                  sizes="(max-width: 768px) 100vw, 1280px"
                />
              </div>
            ))}
          </div>
          {heroImages.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.slideButton} ${styles.prev}`}
                onClick={() =>
                  setCurrentSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))
                }
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.slideButton} ${styles.next}`}
                onClick={() =>
                  setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))
                }
                aria-label="Next slide"
              >
                ›
              </button>
              <div className={styles.heroDots}>
                {heroImages.map((image, idx) => (
                  <button
                    key={`${image}-dot-${idx}`}
                    className={`${styles.heroDot} ${idx === currentSlide ? styles.activeDot : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.heroOverlay}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroName}>{sellerName}</h1>
            <p className={styles.heroSubtitle}>{seller.email}</p>
            <p className={styles.heroMeta}>Selling on HairPros since {establishedDate}</p>

          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.profileLayout}>
          <aside className={styles.sidebar}>
            <section className={styles.infoCard}>
              <h2 className={styles.cardTitle}>Contact</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <a href={`mailto:${seller.email}`} className={styles.infoValue}>
                    {seller.email}
                  </a>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Joined</span>
                  <span className={styles.infoValue}>{establishedDate}</span>
                </div>
              </div>
            </section>

            <section className={styles.infoCard}>
              <h2 className={styles.cardTitle}>Store insights</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{totalProducts}</span>
                  <span className={styles.statLabel}>Products</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{totalStock}</span>
                  <span className={styles.statLabel}>Items in stock</span>
                </div>
              </div>
            </section>
          </aside>

          <main className={styles.mainContent}>
            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Products</h2>
                <p className={styles.sectionSubtitle}>
                  Explore {sellerName.split(' ')[0] || 'the seller'}'s curated collection.
                </p>
              </header>

              {enrichedProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>This seller hasn't published any products yet.</p>
                </div>
              ) : (
                <div className={styles.cardsGrid}>
                  {enrichedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOrderSuccess={fetchSeller}
                      showSellerLink={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

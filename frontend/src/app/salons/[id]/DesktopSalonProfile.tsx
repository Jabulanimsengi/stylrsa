'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FaHeart, FaGlobe, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import styles from './SalonProfile.module.css';
import booksyStyles from './BooksyLayout.module.css';
import mobileStyles from './MobileSalonProfile.module.css';
import SocialShare from '@/components/SocialShare/SocialShare';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import {
  HeroGallery,
  BooksyReviewsSection,
  StickyTabNavigation,
  AboutSection,
} from './BooksyComponents';
import FreshaServiceList from '@/components/FreshaServiceList';
import { getSalonUrl } from '@/utils/salonUrl';

interface DesktopSalonProfileProps {
  salon: Salon;
  services: Service[];
  galleryImages: GalleryImage[];
  reviews: Review[];
  hoursRecord: Record<string, string> | null;
  todayLabel: string;
  orderedOperatingDays: string[];
  mapsHref: string;
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
  authStatus: 'authenticated' | 'unauthenticated' | 'loading';
  logoError: boolean;
  setLogoError: Dispatch<SetStateAction<boolean>>;
  openLightbox: (images: string[], index: number) => void;
  onToggleFavorite: () => void;
  onBookServices: (selectedServices: Service[]) => void;
}

export default function DesktopSalonProfile({
  salon,
  services,
  galleryImages,
  reviews,
  hoursRecord,
  todayLabel,
  orderedOperatingDays,
  mapsHref,
  activeSection,
  setActiveSection,
  authStatus,
  logoError,
  setLogoError,
  openLightbox,
  onToggleFavorite,
  onBookServices,
}: DesktopSalonProfileProps) {
  const galleryImageUrls = galleryImages.map((img) => img.imageUrl);
  const bookingTypeLabel = salon.bookingType === 'BOTH'
    ? 'Mobile and in-salon bookings'
    : salon.bookingType === 'MOBILE'
      ? 'Mobile bookings available'
      : 'In-salon bookings';

  return (
    <div className={mobileStyles.desktopProfile}>
      <div className={styles.container}>
        <section className={styles.profileHero}>
          {salon.backgroundImage && (
            <div className={styles.profileHeroBackdrop}>
              <OptimizedImage
                src={salon.backgroundImage}
                alt={`${salon.name} background`}
                fill
                eager
                className={styles.profileHeroImage}
                sizes="100vw"
                seoContext={{ salonName: salon.name, city: salon.city }}
              />
              <div className={styles.profileHeroOverlay} />
            </div>
          )}

          <div className={styles.profileHeroCard}>
            <div className={styles.profileHeroTopRow}>
              <div className={styles.profileIdentityBlock}>
                {salon.logo && !logoError ? (
                  <button
                    type="button"
                    className={styles.logoButton}
                    onClick={() => openLightbox([salon.logo!], 0)}
                    title="View full logo"
                  >
                    <OptimizedImage
                      src={salon.logo}
                      alt={`${salon.name} logo`}
                      className={styles.salonLogo}
                      width={88}
                      height={88}
                      seoContext={{ salonName: salon.name, city: salon.city }}
                      onError={() => setLogoError(true)}
                      eager
                    />
                  </button>
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <span>{salon.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}

                <div className={styles.profileCopy}>
                  <span className={styles.profileEyebrow}>Salon profile</span>
                  <h1 className={styles.profileTitle}>
                    {salon.name}
                    {salon.isVerified && <VerificationBadge size="small" />}
                  </h1>
                  <div className={styles.profileMetaRow}>
                    {salon.city && (
                      <span className={styles.profileMetaPill}>
                        <FaMapMarkerAlt /> {salon.city}, {salon.province}
                      </span>
                    )}
                    <span className={styles.profileMetaPill}>{bookingTypeLabel}</span>
                    {salon.website && (
                      <a
                        href={salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.profileMetaPill}
                      >
                        <FaGlobe /> Website
                      </a>
                    )}
                    {salon.whatsapp && (
                      <a
                        href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.profileMetaPill}
                      >
                        <FaWhatsapp /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.profileActionCluster}>
                <SocialShare
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}${getSalonUrl(salon)}`}
                  title={salon.name}
                  description={salon.description || `Check out ${salon.name} on Stylr SA`}
                  image={salon.backgroundImage || ''}
                  variant="button"
                />
                {authStatus === 'authenticated' && (
                  <button onClick={onToggleFavorite} className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}>
                    <FaHeart />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.profileTrustGrid}>
              <div className={styles.profileTrustCard}>
                <span className={styles.profileTrustLabel}>Rating</span>
                <strong className={styles.profileTrustValue}>
                  {salon.avgRating && salon.avgRating > 0 ? salon.avgRating.toFixed(1) : 'New'}
                </strong>
                <span className={styles.profileTrustHint}>
                  {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className={styles.profileTrustCard}>
                <span className={styles.profileTrustLabel}>Availability</span>
                <strong className={styles.profileTrustValue}>
                  {salon.isAvailableNow ? 'Open now' : 'Closed'}
                </strong>
                <span className={styles.profileTrustHint}>Live booking status</span>
              </div>
              <div className={styles.profileTrustCard}>
                <span className={styles.profileTrustLabel}>Services</span>
                <strong className={styles.profileTrustValue}>{services.length}</strong>
                <span className={styles.profileTrustHint}>Treatments listed</span>
              </div>
              <div className={styles.profileTrustCard}>
                <span className={styles.profileTrustLabel}>Gallery</span>
                <strong className={styles.profileTrustValue}>{galleryImages.length}</strong>
                <span className={styles.profileTrustHint}>Portfolio images</span>
              </div>
            </div>
          </div>
        </section>

        <StickyTabNavigation
          activeSection={activeSection}
          onTabClick={(sectionId) => {
            setActiveSection(sectionId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          hasPhotos={galleryImages.length > 0}
          hasTeam={true}
          reviewsCount={reviews.length}
        />

        <div className={booksyStyles.booksyLayout}>
          <div className={booksyStyles.booksyMain}>
            {activeSection === 'photos-section' && (
              <section className={booksyStyles.sectionContainerNoPadding}>
                <HeroGallery
                  salon={salon}
                  galleryImages={galleryImages}
                  onShowAllPhotos={() => openLightbox(galleryImageUrls, 0)}
                  onOpenLightbox={openLightbox}
                />
              </section>
            )}

            {activeSection === 'services-section' && (
              <section className={booksyStyles.sectionContainer}>
                <FreshaServiceList
                  services={services}
                  salon={salon}
                  onBook={onBookServices}
                  onImageClick={openLightbox}
                />
              </section>
            )}

            {activeSection === 'team-section' && (
              <section className={booksyStyles.sectionContainer}>
                <TeamMembers salonId={salon.id} isEditable={false} />
              </section>
            )}

            {activeSection === 'reviews-section' && (
              <section className={booksyStyles.sectionContainer}>
                <BooksyReviewsSection
                  reviews={reviews}
                  avgRating={salon.avgRating || 0}
                  galleryImages={galleryImages}
                  onOpenLightbox={openLightbox}
                />
              </section>
            )}

            {activeSection === 'about-section' && (
              <section className={booksyStyles.sectionContainer}>
                <AboutSection
                  salon={salon}
                  latitude={salon.latitude}
                  longitude={salon.longitude}
                  mapsHref={mapsHref}
                  hoursRecord={hoursRecord}
                  todayLabel={todayLabel}
                  orderedOperatingDays={orderedOperatingDays}
                />
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

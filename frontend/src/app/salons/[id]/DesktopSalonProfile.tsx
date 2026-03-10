'use client';

import type { Dispatch, SetStateAction } from 'react';
import { FaHeart, FaGlobe, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import styles from './SalonProfile.module.css';
import booksyStyles from './BooksyLayout.module.css';
import mobileStyles from './MobileSalonProfile.module.css';
import PageNav from '@/components/PageNav';
import SocialShare from '@/components/SocialShare/SocialShare';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
import SimilarSalons from '@/components/SimilarSalons/SimilarSalons';
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

  return (
    <div className={mobileStyles.desktopProfile}>
      <PageNav />
      <div className={styles.stickyHeaderContent}>
        <div className={styles.headerLeftSection}>
          {salon.logo && !logoError ? (
            <div
              className={styles.logoWrapper}
              onClick={() => openLightbox([salon.logo || ''], 0)}
              style={{ cursor: 'pointer' }}
              title="Click to view full logo"
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
            </div>
          ) : (
            <div className={styles.logoPlaceholder}>
              <span>{salon.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className={styles.headerSalonInfo}>
            <h1 className={styles.headerSalonName}>
              {salon.name}
              {salon.isVerified && <VerificationBadge size="small" />}
            </h1>
            {salon.city && (
              <span className={styles.headerSalonLocation}>
                <FaMapMarkerAlt /> {salon.city}, {salon.province}
              </span>
            )}
            {(salon.website || salon.whatsapp) && (
              <div className={styles.headerContactLinks}>
                {salon.website && (
                  <a
                    href={salon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.headerContactLink}
                    title="Visit website"
                  >
                    <FaGlobe /> Website
                  </a>
                )}
                {salon.whatsapp && (
                  <a
                    href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.headerContactLink}
                    title="Message on WhatsApp"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={styles.headerSpacer}>
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

      <div className={styles.container}>
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

          <SimilarSalons
            currentSalonId={salon.id}
            city={salon.city}
            province={salon.province}
          />
        </div>
      </div>
    </div>
  );
}

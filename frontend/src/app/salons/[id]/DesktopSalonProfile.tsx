'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { IconType } from 'react-icons';
import { FaGoogle, FaHeart, FaGlobe, FaMapMarkerAlt, FaStar, FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { Salon, Service, GalleryImage } from '@/types';
import styles from './SalonProfile.module.css';
import booksyStyles from './BooksyLayout.module.css';
import mobileStyles from './MobileSalonProfile.module.css';
import SocialShare from '@/components/SocialShare/SocialShare';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import TeamMembers from '@/components/TeamMembers/TeamMembers';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import {
  HeroGallery,
  ExternalReviewsSection,
  StickyTabNavigation,
  AboutSection,
} from './BooksyComponents';
import FreshaServiceList from '@/components/FreshaServiceList';
import { getSalonUrl } from '@/utils/salonUrl';

interface DesktopSalonProfileProps {
  salon: Salon;
  services: Service[];
  galleryImages: GalleryImage[];
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
  onBookingSuccess: () => void;
  isBookingJourneyActive: boolean;
}

export default function DesktopSalonProfile({
  salon,
  services,
  galleryImages,
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
  onBookingSuccess,
  isBookingJourneyActive,
}: DesktopSalonProfileProps) {
  const galleryImageUrls = galleryImages.map((img) => img.imageUrl);
  const bookingTypeLabel = salon.bookingType === 'BOTH'
    ? 'Mobile and in-salon bookings'
    : salon.bookingType === 'MOBILE'
      ? 'Mobile bookings available'
      : 'In-salon bookings';
  const socialLinks = [
    salon.facebookUrl ? { href: salon.facebookUrl, label: 'Facebook', icon: FaFacebookF } : null,
    salon.instagramUrl ? { href: salon.instagramUrl, label: 'Instagram', icon: FaInstagram } : null,
    salon.tiktokUrl ? { href: salon.tiktokUrl, label: 'TikTok', icon: FaTiktok } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: IconType }>;
  const externalReviewLinks = [
    salon.googleReviewsUrl ? { href: salon.googleReviewsUrl, label: 'Google reviews', icon: FaGoogle } : null,
    salon.freshaReviewsUrl ? { href: salon.freshaReviewsUrl, label: 'Fresha reviews', icon: FaStar } : null,
    salon.booksyReviewsUrl ? { href: salon.booksyReviewsUrl, label: 'Booksy reviews', icon: FaStar } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: IconType }>;

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
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.profileMetaPill}
                        >
                          <Icon /> {social.label}
                        </a>
                      );
                    })}
                  </div>
                  <p className={styles.profileBookingNote}>
                    Fast handoff: send your request on Stylr SA, then confirm the final details directly with the salon on WhatsApp.
                  </p>
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
                <span className={styles.profileTrustLabel}>Review Links</span>
                <strong className={styles.profileTrustValue}>
                  {externalReviewLinks.length > 0 ? externalReviewLinks.length : '--'}
                </strong>
                <span className={styles.profileTrustHint}>
                  {externalReviewLinks.length > 0
                    ? `Connected platform${externalReviewLinks.length === 1 ? '' : 's'}`
                    : 'No external review links yet'}
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
          reviewLinksCount={externalReviewLinks.length}
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
                  onBookingSuccess={onBookingSuccess}
                  onImageClick={openLightbox}
                  isBookingJourneyActive={isBookingJourneyActive}
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
                <ExternalReviewsSection salon={salon} />
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

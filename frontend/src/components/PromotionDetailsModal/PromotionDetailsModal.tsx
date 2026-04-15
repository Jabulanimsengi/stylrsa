'use client';

import Image from 'next/image';
import styles from './PromotionDetailsModal.module.css';
import { Button, ModalShell } from '@/components/ui';
import type { Promotion } from '@/components/PromotionCard';

type PromotionDetails = Promotion & {
  originalPrice: number;
  promotionalPrice: number;
  discountPercentage: number;
  endDate: string;
  service?: {
    title: string;
    images?: string[];
  } | null;
};

interface PromotionDetailsModalProps {
  promotion: PromotionDetails | null;
  isOpen: boolean;
  onClose: () => void;
  salon?: unknown;
  onBookNow?: () => void;
}

function calculateTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else {
    return 'Ending soon';
  }
}

export default function PromotionDetailsModal({
  promotion,
  isOpen,
  onClose,
  salon: _salon,
  onBookNow,
}: PromotionDetailsModalProps) {
  if (!isOpen || !promotion) return null;

  const service = promotion.service;
  const timeRemaining = calculateTimeRemaining(promotion.endDate);
  const savings = promotion.originalPrice - promotion.promotionalPrice;

  const handleBookNow = () => {
    onClose();
    
    if (onBookNow) {
      // Use callback if provided (for salon profile page)
      onBookNow();
    } else {
      // Fallback: scroll to services section
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <ModalShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Special Promotion"
      description="Limited-time pricing from this salon."
      size="lg"
      bodyClassName="px-0 py-0"
      className={styles.modal}
    >
      <div className={styles.header}>
        <div className={styles.discountBadge}>
          {promotion.discountPercentage}% off
        </div>
      </div>

      {service?.images?.[0] && (
        <div className={styles.imageWrapper}>
          <Image
            src={service.images[0]}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.serviceTitle}>{service?.title}</h3>

        <div className={styles.priceSection}>
          <div className={styles.priceRow}>
            <span className={styles.label}>Original Price:</span>
            <span className={styles.originalPrice}>
              R{promotion.originalPrice.toFixed(2)}
            </span>
          </div>
          <div className={styles.priceRow}>
            <span className={styles.label}>Promotional Price:</span>
            <span className={styles.promoPrice}>
              R{promotion.promotionalPrice.toFixed(2)}
            </span>
          </div>
          <div className={styles.savings}>
            You save R{savings.toFixed(2)}
          </div>
        </div>

        <div className={styles.timeInfo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{timeRemaining}</span>
        </div>

        <Button onClick={handleBookNow} className={styles.bookButton}>
          Book on WhatsApp
        </Button>
      </div>
    </ModalShell>
  );
}

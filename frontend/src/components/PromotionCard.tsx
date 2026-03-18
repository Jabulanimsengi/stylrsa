'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import { SkeletonCard } from './Skeleton/Skeleton';
import BookingConfirmationModal from './BookingConfirmationModal/BookingConfirmationModal';
import { toast } from 'react-toastify';
import { getSalonUrl } from '@/utils/salonUrl';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { FaClock } from 'react-icons/fa';
import type { Salon } from '@/types';

const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f3f4f6"/%3E%3Cstop offset="100%25" stop-color="%23d1d5db"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="600" height="400" fill="url(%23g)"/%3E%3Cg fill="%239ca3af" font-family="Arial, sans-serif" font-size="28" font-weight="600" text-anchor="middle"%3E%3Ctext x="50%25" y="52%25"%3ENo Image%3C/text%3E%3C/g%3E%3C/svg%3E';

export interface Promotion {
  id: string;
  discountPercentage: number;
  originalPrice: number;
  promotionalPrice: number;
  startDate: string;
  endDate: string;
  service?: {
    id: string;
    title: string;
    images: string[];
    salon: {
      id: string;
      name: string;
      city: string;
      province: string;
      slug?: string | null;
    };
  };
  product?: {
    id: string;
    name: string;
    images: string[];
    seller: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

type PromotionService = NonNullable<Promotion['service']>;
interface PromotionCardProps {
  promotion: Promotion;
  onImageClick?: (images: string[], startIndex: number) => void;
  onBookNow?: (salonData: Salon, service: PromotionService) => void;
}

function calculateTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d left`;
  } else if (hours > 0) {
    return `${hours}h left`;
  } else {
    return 'Ending soon';
  }
}

export default function PromotionCard({ promotion, onImageClick, onBookNow }: PromotionCardProps) {
  const router = useRouter();
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [salonData, setSalonData] = useState<Salon | null>(null);

  const isService = Boolean(promotion.service);
  const serviceItem = promotion.service;
  const productItem = promotion.product;
  const item = isService ? serviceItem : productItem;

  if (!item) return null;

  const title = isService ? serviceItem!.title : productItem!.name;
  const images = item.images || [];
  const primaryImage = images[0];

  const salonId = isService ? serviceItem?.salon?.id : undefined;
  const salonName = isService ? serviceItem?.salon?.name : undefined;
  const sellerName = !isService
    ? `${productItem?.seller?.firstName || ''} ${productItem?.seller?.lastName || ''}`.trim()
    : undefined;

  const locationParts = isService
    ? [serviceItem?.salon?.city, serviceItem?.salon?.province].filter(Boolean)
    : [];
  const location = locationParts.length ? locationParts.join(', ') : '';

  const optimizedSrc = primaryImage
    ? transformCloudinary(primaryImage, {
      width: 600,
      quality: 'auto',
      format: 'auto',
      crop: 'fill',
    })
    : DEFAULT_PLACEHOLDER_IMAGE;

  const isCloudinarySource = typeof primaryImage === 'string' && primaryImage.includes('/image/upload/');
  const linkHref = isService && promotion.service?.salon ? getSalonUrl(promotion.service.salon) : '#';
  const timeRemaining = calculateTimeRemaining(promotion.endDate);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 0 && onImageClick) {
      onImageClick(images, 0);
    }
  };

  const handleBookNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!salonId || linkHref === '#') return;

    setIsLoadingBooking(true);
    try {
      const response = await fetch(`/api/salons/${salonId}`);
      if (!response.ok) throw new Error('Failed to fetch salon details');

      const salon = await response.json();

      if (salon.bookingMessage) {
        setSalonData(salon);
        setShowConfirmation(true);
      } else {
        router.push(linkHref);
      }
    } catch (error) {
      console.error('Error fetching salon:', error);
      toast.error('Failed to load salon details');
      setIsLoadingBooking(false);
      router.push(linkHref);
    }
  };

  const handleConfirmationAccept = () => {
    setShowConfirmation(false);
    setIsLoadingBooking(false);

    if (onBookNow && salonData && promotion.service) {
      onBookNow(salonData, promotion.service);
      setSalonData(null);
    } else if (linkHref && linkHref !== '#') {
      setSalonData(null);
      router.push(linkHref);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSalonData(null);
    setIsLoadingBooking(false);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
        {/* Image */}
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={optimizedSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={!isCloudinarySource}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs bg-black/60 text-white rounded">
              1/{images.length}
            </span>
          )}

          {/* Discount badge */}
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
            {promotion.discountPercentage}% OFF
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{title}</h3>

          {isService && salonName && (
            <p className="text-sm text-muted-foreground">{salonName}</p>
          )}
          {!isService && sellerName && (
            <p className="text-sm text-muted-foreground">Sold by {sellerName}</p>
          )}
          {location && (
            <p className="text-xs text-muted-foreground mb-2">{location}</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground line-through">
              R{promotion.originalPrice.toFixed(2)}
            </span>
            <span className="font-bold text-primary">
              R{promotion.promotionalPrice.toFixed(2)}
            </span>
          </div>

          {/* Time remaining */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <FaClock className="w-3 h-3" />
            {timeRemaining}
          </div>

          {/* Book button */}
          {isService && salonId && (
            <Button
              onClick={handleBookNow}
              className="w-full bookingButton"
              size="sm"
              disabled={isLoadingBooking}
            >
              {isLoadingBooking ? 'Loading...' : 'Book Now'}
            </Button>
          )}
        </CardContent>
      </Card>

      <BookingConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        onAccept={handleConfirmationAccept}
        salonName={salonData?.name || ''}
        salonLogo={salonData?.backgroundImage || undefined}
        message={salonData?.bookingMessage || ''}
      />
    </>
  );
}

export function PromotionCardSkeleton() {
  return <SkeletonCard hasImage lines={4} />;
}

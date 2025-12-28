'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import ProductOrderModal from './ProductOrderModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'react-toastify';
import { getPlaceholder } from '@/lib/placeholders';
import { sanitizeText } from '@/lib/sanitize';
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  Card,
  CardContent,
  Button,
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onOrderSuccess?: () => void;
  onOpenLightbox?: (images: string[], index: number) => void;
  showSellerLink?: boolean;
}

export default function ProductCard({
  product,
  onOrderSuccess,
  onOpenLightbox,
  showSellerLink = true,
}: ProductCardProps) {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const images = useMemo(() => {
    const unique = Array.isArray(product.images)
      ? product.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx)
      : [];
    return unique.length > 0 ? unique : [getPlaceholder('wide')];
  }, [product.images]);
  const [activeImage, setActiveImage] = useState(0);

  const handleOrderClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (authStatus !== 'authenticated') {
      openModal('login');
      toast.info('Log in to place an order.');
      return;
    }
    setIsOrderOpen(true);
  };

  const handleImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onOpenLightbox) {
      onOpenLightbox(images, activeImage);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success('Added to wishlist!');
    } else {
      toast.success('Removed from wishlist');
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <>
      <Link href={productUrl} className="block group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {/* Image Container */}
          <div
            className="relative aspect-[4/3] overflow-hidden cursor-pointer"
            onClick={handleImageClick}
          >
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={cn(
                'absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200',
                'bg-white/90 hover:bg-white shadow-sm',
                isWishlisted && 'text-red-500'
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
            </button>

            {/* Image */}
            <Image
              key={images[activeImage]}
              src={images[activeImage]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />

            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <FaChevronRight className="w-3 h-3" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all',
                        idx === activeImage
                          ? 'bg-white w-3'
                          : 'bg-white/60 hover:bg-white/80'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveImage(idx);
                      }}
                      aria-label={`Show image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
              <p className="font-bold text-primary whitespace-nowrap">R{product.price.toFixed(2)}</p>
            </div>

            {product.description && (
              <>
                <p
                  className={cn(
                    'text-sm text-muted-foreground mb-2',
                    isExpanded ? '' : 'line-clamp-2'
                  )}
                >
                  {sanitizeText(product.description)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs text-primary hover:underline mb-3"
                >
                  {isExpanded ? 'View Less' : 'View More'}
                </button>
              </>
            )}

            <Button
              onClick={handleOrderClick}
              className="w-full"
              size="sm"
            >
              Order
            </Button>
          </CardContent>
        </Card>
      </Link>

      <ProductOrderModal
        product={product}
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        onSuccess={onOrderSuccess}
      />
    </>
  );
}

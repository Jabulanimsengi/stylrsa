'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  fallbackSrc?: string;
  eager?: boolean;
  seoContext?: {
    serviceName?: string;
    salonName?: string;
    city?: string;
    category?: string;
  };
}

/**
 * SEO-optimized Image component with:
 * - Descriptive alt text generation
 * - Lazy loading by default
 * - Error handling with fallback
 * - Proper sizing attributes
 * - Blur placeholder support
 */
export default function OptimizedImage({
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  eager = false,
  seoContext,
  priority,
  loading,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(props.src);
  const [hasError, setHasError] = useState(false);

  // Generate SEO-friendly alt text if context is provided
  const generateAltText = (): string => {
    if (seoContext) {
      const parts: string[] = [];
      
      if (seoContext.serviceName) parts.push(seoContext.serviceName);
      if (seoContext.salonName) parts.push(`by ${seoContext.salonName}`);
      if (seoContext.city) parts.push(`in ${seoContext.city}`);
      if (seoContext.category) parts.push(`- ${seoContext.category}`);
      
      return parts.length > 0 ? parts.join(' ') : alt;
    }
    
    return alt;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const optimizedAlt = generateAltText();
  const shouldPrioritize = Boolean(priority || eager);
  const imageLoading = shouldPrioritize ? undefined : (loading ?? 'lazy');

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={optimizedAlt}
      priority={shouldPrioritize}
      loading={imageLoading}
      onError={handleError}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
      sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
    />
  );
}

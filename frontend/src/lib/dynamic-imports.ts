/**
 * Dynamic imports for heavy components
 * Reduces initial bundle size and memory usage
 */

import dynamic from 'next/dynamic';

// Lazy load Mapbox (2.3MB) - only load when map is needed
export const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-200" />
});

// Lazy load Swiper carousel (300KB)
export const Swiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), {
  ssr: false,
});

export const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), {
  ssr: false,
});

// Lazy load Socket.io (200KB) - only when user is authenticated
export const SocketProvider = dynamic(
  () => import('@/context/SocketContext').then(mod => ({ default: mod.SocketProvider })),
  { ssr: false }
);

// Lazy load date picker (only on booking forms)
export const DatePicker = dynamic(() => import('react-datepicker'), {
  ssr: false,
});

// Lazy load image lightbox (only when image is clicked)
export const ImageLightbox = dynamic(() => import('@/components/ImageLightbox'), {
  ssr: false,
});

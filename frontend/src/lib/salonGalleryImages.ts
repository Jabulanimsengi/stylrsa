import type { GalleryImage, Salon } from '@/types';

function pushUniqueImage(images: string[], candidate: string | null | undefined) {
  if (typeof candidate !== 'string') {
    return;
  }

  const trimmed = candidate.trim();
  if (!trimmed || images.includes(trimmed)) {
    return;
  }

  images.push(trimmed);
}

export function getSalonGalleryImages(salon: Partial<Salon> | null | undefined, galleryImages: GalleryImage[] = []): string[] {
  const images: string[] = [];

  salon?.heroImages?.forEach((image) => {
    pushUniqueImage(images, image);
  });

  galleryImages.forEach((image) => {
    pushUniqueImage(images, image.imageUrl);
  });

  return images;
}

export function getSalonShowcaseImages(salon: Partial<Salon> | null | undefined, galleryImages: GalleryImage[] = []): string[] {
  const images: string[] = [];

  pushUniqueImage(images, salon?.backgroundImage);

  getSalonGalleryImages(salon, galleryImages).forEach((image) => {
    pushUniqueImage(images, image);
  });

  if (images.length === 0) {
    pushUniqueImage(images, salon?.logo);
  }

  return images;
}

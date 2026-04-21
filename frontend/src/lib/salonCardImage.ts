import type { Salon } from '@/types';

function firstNonEmpty(values: Array<string | null | undefined>): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

export function getSalonCardImage(salon: Partial<Salon> | null | undefined): string | undefined {
  if (!salon) {
    return undefined;
  }

  const galleryImage = salon.gallery?.find((image) => typeof image?.imageUrl === 'string' && image.imageUrl.trim().length > 0)?.imageUrl;
  const heroImage = salon.heroImages?.find((image) => typeof image === 'string' && image.trim().length > 0);

  return firstNonEmpty([
    salon.backgroundImage,
    heroImage,
    galleryImage,
    salon.logo,
  ]);
}

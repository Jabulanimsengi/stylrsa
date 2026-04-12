import type { Service } from '@/types';

export function getServiceDiscountPercentage(service: Pick<Service, 'discountPercentage'>): number | null {
  if (typeof service.discountPercentage !== 'number' || service.discountPercentage <= 0) {
    return null;
  }

  return Math.min(service.discountPercentage, 95);
}

export function getServiceDiscountedPrice(service: Pick<Service, 'price' | 'discountPercentage'>): number {
  const discountPercentage = getServiceDiscountPercentage(service);

  if (!discountPercentage) {
    return service.price;
  }

  return Number((service.price * (1 - discountPercentage / 100)).toFixed(2));
}

export function hasServiceDiscount(service: Pick<Service, 'discountPercentage'>): boolean {
  return getServiceDiscountPercentage(service) !== null;
}

export function formatServiceDiscountLabel(service: Pick<Service, 'discountPercentage'>): string | null {
  const discountPercentage = getServiceDiscountPercentage(service);
  if (!discountPercentage) {
    return null;
  }

  const wholeNumber = Number.isInteger(discountPercentage);
  return `${wholeNumber ? discountPercentage.toFixed(0) : discountPercentage.toFixed(1)}% off`;
}

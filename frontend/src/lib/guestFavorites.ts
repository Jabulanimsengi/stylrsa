import { STORAGE_KEYS } from '@/constants/config';
import { Salon } from '@/types';

type GuestFavoriteSnapshot = Pick<
  Salon,
  | 'id'
  | 'name'
  | 'slug'
  | 'backgroundImage'
  | 'heroImages'
  | 'city'
  | 'province'
  | 'town'
  | 'ownerId'
  | 'createdAt'
  | 'updatedAt'
  | 'avgRating'
  | 'reviewCount'
  | 'isAvailableNow'
  | 'isVerified'
>;

const GUEST_FAVORITES_KEY = STORAGE_KEYS.guestFavorites;

function canUseStorage() {
  return typeof window !== 'undefined';
}

function normalizeSnapshot(salon: Partial<Salon> & { id: string; name: string }): GuestFavoriteSnapshot {
  const now = new Date().toISOString();

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug ?? null,
    backgroundImage: salon.backgroundImage ?? null,
    heroImages: salon.heroImages ?? [],
    city: salon.city ?? '',
    province: salon.province ?? '',
    town: salon.town ?? salon.city ?? '',
    ownerId: salon.ownerId ?? '',
    createdAt: salon.createdAt ?? now,
    updatedAt: salon.updatedAt ?? now,
    avgRating: salon.avgRating ?? 0,
    reviewCount: salon.reviewCount ?? 0,
    isAvailableNow: Boolean(salon.isAvailableNow),
    isVerified: Boolean(salon.isVerified),
  };
}

export function getGuestFavoriteSalons(): GuestFavoriteSnapshot[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(GUEST_FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getGuestFavoriteSalonIds(): Set<string> {
  return new Set(getGuestFavoriteSalons().map((salon) => salon.id));
}

export function applyGuestFavoritesToSalons<T extends { id: string; isFavorited?: boolean }>(salons: T[]): T[] {
  const favoriteIds = getGuestFavoriteSalonIds();
  return salons.map((salon) => ({
    ...salon,
    isFavorited: favoriteIds.has(salon.id),
  }));
}

export function toggleGuestFavoriteSalon(salon: Partial<Salon> & { id: string; name: string }) {
  const favorites = getGuestFavoriteSalons();
  const exists = favorites.some((item) => item.id === salon.id);
  const nextFavorites = exists
    ? favorites.filter((item) => item.id !== salon.id)
    : [normalizeSnapshot(salon), ...favorites.filter((item) => item.id !== salon.id)];

  if (canUseStorage()) {
    window.localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(nextFavorites));
  }

  return {
    favorited: !exists,
    favorites: nextFavorites,
  };
}

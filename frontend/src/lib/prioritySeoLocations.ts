export type PrioritySeoLocation = {
  location: string;
  city: string;
  name: string;
  segment: 'metro' | 'wealth-hub';
};

export const PRIORITY_CITY_LOCATION_TARGETS: PrioritySeoLocation[] = [
  { location: 'gauteng', city: 'johannesburg', name: 'Johannesburg', segment: 'metro' },
  { location: 'gauteng', city: 'pretoria', name: 'Pretoria', segment: 'metro' },
  { location: 'gauteng', city: 'sandton', name: 'Sandton', segment: 'wealth-hub' },
  { location: 'western-cape', city: 'cape-town', name: 'Cape Town', segment: 'metro' },
  { location: 'western-cape', city: 'stellenbosch', name: 'Stellenbosch', segment: 'wealth-hub' },
  { location: 'western-cape', city: 'franschhoek', name: 'Franschhoek', segment: 'wealth-hub' },
  { location: 'western-cape', city: 'hout-bay', name: 'Hout Bay', segment: 'wealth-hub' },
  { location: 'kwazulu-natal', city: 'durban', name: 'Durban', segment: 'metro' },
  { location: 'kwazulu-natal', city: 'umhlanga', name: 'Umhlanga', segment: 'wealth-hub' },
  { location: 'kwazulu-natal', city: 'ballito', name: 'Ballito', segment: 'wealth-hub' },
];

export function getAffluentLocationLinks(options?: {
  province?: string;
  excludeCity?: string;
  limit?: number;
  fallbackToNational?: boolean;
}): Array<{ name: string; url: string }> {
  const province = options?.province?.trim().toLowerCase();
  const excludeCity = options?.excludeCity?.trim().toLowerCase();
  const limit = options?.limit ?? 6;
  const fallbackToNational = options?.fallbackToNational ?? false;

  const scopedTargets = PRIORITY_CITY_LOCATION_TARGETS.filter((target) => {
    if (target.segment !== 'wealth-hub') {
      return false;
    }

    if (province && target.location !== province) {
      return false;
    }

    if (excludeCity && target.city === excludeCity) {
      return false;
    }

    return true;
  });

  const targets = scopedTargets.length > 0
    ? scopedTargets
    : fallbackToNational
      ? PRIORITY_CITY_LOCATION_TARGETS.filter(
        (target) => target.segment === 'wealth-hub' && (!excludeCity || target.city !== excludeCity),
      )
      : [];

  return targets
    .slice(0, limit)
    .map((target) => ({
      name: target.name,
      url: `/salons/location/${target.location}/${target.city}`,
    }));
}

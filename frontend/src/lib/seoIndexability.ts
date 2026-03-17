type SeoLandingLike = {
  serviceCount?: number | null;
  salonCount?: number | null;
};

export type SeoLandingDepth = 'national' | 'province' | 'city' | 'suburb';

export function shouldIndexSeoLanding(
  pageData: SeoLandingLike | null | undefined,
  depth: SeoLandingDepth,
): boolean {
  if (!pageData) {
    return false;
  }

  const serviceCount = pageData.serviceCount ?? 0;
  const salonCount = pageData.salonCount ?? 0;

  if (depth === 'city' || depth === 'suburb') {
    return serviceCount > 0 || salonCount > 0;
  }

  return true;
}

export function buildSeoLandingRobots(
  pageData: SeoLandingLike | null | undefined,
  depth: SeoLandingDepth,
) {
  return shouldIndexSeoLanding(pageData, depth)
    ? undefined
    : {
        index: false,
        follow: true,
      };
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface SeoKeyword {
  id: string;
  keyword: string;
  slug: string;
  category: string;
  priority: number;
  searchVolume: number | null;
  difficulty: number | null;
  variations: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SeoLocation {
  id: string;
  name: string;
  slug: string;
  type: string;
  province: string;
  provinceSlug: string;
  parentLocationId: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  population: number | null;
  serviceCount: number;
  salonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelatedLink {
  label: string;
  url: string;
  type: 'service' | 'location';
}

export interface Breadcrumb {
  label: string;
  url: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@graph': any[];
}

export interface SEOPageData {
  keyword: SeoKeyword;
  location: SeoLocation;
  url: string;
  h1: string;
  h2Headings: string[];
  h3Headings: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbs: Breadcrumb[];
  relatedServices: RelatedLink[];
  nearbyLocations: RelatedLink[];
  serviceCount: number;
  salonCount: number;
  avgPrice?: number;
}

@Injectable()
export class SEOPageGeneratorService {
  private readonly logger = new Logger(SEOPageGeneratorService.name);
  private readonly cache = new Map<string, { data: SEOPageData; expiry: number }>();
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hour in memory only
  private readonly parentLocationCache = new Map<string, SeoLocation | null>();

  constructor(private prisma: PrismaService) { }

  private getCacheKey(keyword: SeoKeyword, location: SeoLocation): string {
    return `${keyword.id}:${location.id}`;
  }

  private getCached(key: string): SEOPageData | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: SEOPageData): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.MEMORY_CACHE_TTL,
    });
  }

  private async getParentLocation(
    parentLocationId: string | null,
  ): Promise<SeoLocation | null> {
    if (!parentLocationId) {
      return null;
    }

    if (this.parentLocationCache.has(parentLocationId)) {
      return this.parentLocationCache.get(parentLocationId) || null;
    }

    const parentLocation = await this.prisma.seoLocation.findUnique({
      where: { id: parentLocationId },
    });

    this.parentLocationCache.set(parentLocationId, parentLocation);
    return parentLocation;
  }

  /**
   * Generate H1 heading with format: "Find {keyword} in {city}, {province} | Book Online"
   */
  generateH1(keyword: SeoKeyword, location: SeoLocation): string {
    const locationName = this.getLocationDisplayName(location);
    return `Find ${keyword.keyword} in ${locationName} | Book Online`;
  }

  /**
   * Generate H2 headings (3-5 headings)
   */
  generateH2Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
  ): string[] {
    const locationName = this.getLocationDisplayName(location);
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;

    const headings = [
      `Top-Rated ${keyword.keyword} in ${cityName}`,
      `${serviceCount}+ ${keyword.keyword} Services Available`,
      `Why Choose ${keyword.keyword} in ${locationName}?`,
      `Book ${keyword.keyword} Appointments Online`,
    ];

    // Add location-specific heading if it's a city or suburb
    if (location.type !== 'PROVINCE') {
      headings.push(`Best ${keyword.keyword} Near You in ${cityName}`);
    }

    return headings.slice(0, 5); // Return max 5 headings
  }

  /**
   * Generate H3 headings (5-8 headings)
   */
  generateH3Headings(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): string[] {
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;

    const headings = [
      `Professional ${keyword.keyword} Services`,
      `Verified ${keyword.keyword} Providers`,
      `Affordable ${keyword.keyword} Options`,
      `Same-Day ${keyword.keyword} Appointments`,
      `Highly Recommended ${keyword.keyword} in ${cityName}`,
      `Customer Reviews & Ratings`,
      `Compare ${keyword.keyword} Prices`,
      `Book with Confidence`,
    ];

    return headings.slice(0, 8); // Return max 8 headings
  }

  /**
   * Generate meta title (max 60 characters)
   * CTR-optimized with numbers, power words, and urgency
   * Uses keyword-specific patterns based on Search Console data
   */
  generateMetaTitle(keyword: SeoKeyword, location: SeoLocation, serviceCount?: number): string {
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;
    const count = serviceCount && serviceCount > 0 ? serviceCount : null;
    const slug = keyword.slug.toLowerCase();

    // Get current month for freshness signal
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    // Helper to get short keyword (without "near me/you" suffix)
    const getShortKeyword = (kw: SeoKeyword): string => {
      let short = kw.keyword.replace(/\s*near\s*(me|you)\s*$/i, '').trim();
      return short;
    };

    // Keyword-specific high-CTR patterns based on Search Console data
    // These patterns showed 10-40% CTR

    // Walk-in patterns (27% CTR in small towns)
    if (slug.includes('walk-in')) {
      return this.truncate(`Walk-In ${getShortKeyword(keyword)} ${cityName} - No Booking Needed`, 60);
    }

    // 24-hour / late night patterns (10-23% CTR)
    if (slug.includes('24-hour') || slug.includes('late')) {
      return this.truncate(`24-Hour ${getShortKeyword(keyword)} ${cityName} - Open Now`, 60);
    }

    // Pricing patterns (15-30% CTR)
    if (slug.includes('price') || slug.includes('affordable') || slug.includes('cheap')) {
      return this.truncate(`${getShortKeyword(keyword)} Prices ${cityName} - From R150`, 60);
    }

    // Mobile service patterns (20-40% CTR)
    if (slug.includes('mobile')) {
      return this.truncate(`Mobile ${getShortKeyword(keyword)} ${cityName} - We Come to You`, 60);
    }

    // Top 10 patterns (high impressions, needs CTR boost)
    if (slug.includes('top-10') || slug.includes('best')) {
      return this.truncate(`Top 10 ${getShortKeyword(keyword)} ${cityName} (${currentMonth} ${currentYear})`, 60);
    }

    // CTR-optimized title templates for other keywords (rotate based on location hash)
    const templateIndex = this.hashLocationId(location.id) % 5;

    const templates = [
      // Template 1: Number + Location + CTA
      count && count >= 5
        ? `${count}+ ${keyword.keyword} in ${cityName} | Book Now`
        : `Best ${keyword.keyword} ${cityName} | Book Online`,

      // Template 2: Freshness signal
      `${keyword.keyword} ${cityName} ${currentYear} - Book Today`,

      // Template 3: Trust signal
      `${keyword.keyword} ${cityName} | Verified & Reviewed`,

      // Template 4: Price signal
      `${keyword.keyword} ${cityName} - Compare Prices & Book`,

      // Template 5: Rating signal
      `${keyword.keyword} ${cityName} | ⭐ Top Rated`,
    ];

    let title = templates[templateIndex];

    // Ensure it's under 60 characters
    if (title.length > 60) {
      title = count && count >= 5
        ? `${count}+ ${keyword.keyword} ${cityName} | Book`
        : `${keyword.keyword} ${cityName} | Book Now`;

      if (title.length > 60) {
        title = `${keyword.keyword} ${cityName}`;
      }
    }

    return title;
  }

  /**
   * Generate meta description (max 160 characters)
   * CTR-optimized with social proof, urgency, and clear value props
   * Uses keyword-specific patterns based on Search Console data
   */
  generateMetaDescription(
    keyword: SeoKeyword,
    location: SeoLocation,
    count: number,
    avgPrice?: number,
  ): string {
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;
    const priceText = avgPrice ? `from R${Math.round(avgPrice)}` : 'from R150';
    const countText = count > 0 ? `${count}+` : '';
    const slug = keyword.slug.toLowerCase();

    // Helper to get short keyword (without "near me/you" suffix)
    const getShortKeyword = (kw: SeoKeyword): string => {
      return kw.keyword.replace(/\s*near\s*(me|you)\s*$/i, '').trim();
    };
    const shortKeyword = getShortKeyword(keyword);

    // Keyword-specific high-CTR description patterns based on Search Console data

    // Walk-in patterns - emphasize no appointment needed
    if (slug.includes('walk-in')) {
      return this.truncate(
        `Walk-in ${shortKeyword} in ${cityName} - no booking required! ${countText} salons accepting walk-ins today. See wait times & book now.`,
        160
      );
    }

    // 24-hour / late night patterns - emphasize availability
    if (slug.includes('24-hour') || slug.includes('late')) {
      return this.truncate(
        `${shortKeyword} open 24/7 in ${cityName}. Late night & weekend appointments available. ${countText} verified pros. Book now or walk in!`,
        160
      );
    }

    // Mobile service patterns - convenience focused
    if (slug.includes('mobile')) {
      return this.truncate(
        `Mobile ${shortKeyword} in ${cityName} - we come to you! ${countText} verified pros, ${priceText}. Book your home appointment online today!`,
        160
      );
    }

    // Pricing / affordable patterns - price focused
    if (slug.includes('price') || slug.includes('affordable') || slug.includes('cheap')) {
      return this.truncate(
        `Compare ${shortKeyword} prices in ${cityName} ${priceText}. ${countText} affordable options with real reviews. Find the best value & book online!`,
        160
      );
    }

    // Top 10 / best patterns - quality focused
    if (slug.includes('top-10') || slug.includes('best')) {
      return this.truncate(
        `Top 10 ${shortKeyword} in ${cityName} ranked by reviews. ${countText} verified pros, prices ${priceText}. Compare ratings & book online!`,
        160
      );
    }

    // CTR-optimized description templates for other keywords (rotate based on location hash)
    const templateIndex = this.hashLocationId(location.id) % 5;

    const templates = [
      // Template 1: Numbers + Social proof + CTA
      `${countText} verified ${keyword.keyword} in ${cityName}. Prices ${priceText}, real reviews. Book online in 2 mins. Trusted by 10K+ customers!`,

      // Template 2: Urgency + Value
      `Looking for ${keyword.keyword} in ${cityName}? ${countText} top-rated pros, same-day appointments. Prices ${priceText}. Book now!`,

      // Template 3: Question + Solution
      `Need ${keyword.keyword} in ${cityName}? Browse ${countText} verified salons, compare prices & reviews. Book your appointment online today!`,

      // Template 4: Benefits-focused
      `${countText} ${keyword.keyword} in ${cityName}. ✓ Verified ✓ Reviews ✓ Instant booking ✓ Prices ${priceText}. Book now!`,

      // Template 5: Local + Trust
      `Find ${keyword.keyword} in ${cityName}. ${countText} local pros, honest reviews, prices ${priceText}. Book online 24/7!`,
    ];

    let description = templates[templateIndex];

    // Ensure it's under 160 characters
    if (description.length > 160) {
      description = `${countText} ${keyword.keyword} in ${cityName}. Compare prices, read reviews & book online. Verified professionals!`;

      if (description.length > 160) {
        description = `Book ${keyword.keyword} in ${cityName}. ${countText} verified pros. Compare & book today!`;
      }
    }

    return description;
  }

  /**
   * Generate unique introductory text (150-300 words)
   * Rotates between 5 different templates based on location ID
   */
  generateIntroText(
    keyword: SeoKeyword,
    location: SeoLocation,
    serviceCount: number,
    salonCount: number,
    avgPrice?: number,
  ): string {
    const locationName = this.getLocationDisplayName(location);
    const cityName = location.type === 'PROVINCE' ? location.name : location.name;
    const provinceName = location.province;

    // Select template based on location ID hash (ensures consistency)
    const templateIndex = this.hashLocationId(location.id) % 5;

    const templates = [
      // Template 1: Standard
      `Looking for the best ${keyword.keyword} in ${locationName}? Stylr SA connects you with ${serviceCount} verified services from ${salonCount} top-rated salons and beauty professionals. Compare prices, read authentic reviews, and book appointments online instantly—all in one place.

Whether you're searching for ${keyword.keyword} for a special occasion or regular maintenance, ${cityName} offers a diverse range of options to suit every style and budget. Our platform makes it easy to discover highly-rated professionals near you, view their portfolios, check real-time availability, and secure your booking in just a few clicks.

${avgPrice ? `Average prices for ${keyword.keyword} in ${cityName} start from R${avgPrice.toFixed(0)}.` : ''} Browse verified reviews from real customers, compare service offerings, and find the perfect match for your beauty needs. Book with confidence knowing that all our listed professionals are vetted and highly recommended by the ${cityName} community.`,

      // Template 2: Benefits-focused
      `Discover ${serviceCount} exceptional ${keyword.keyword} options in ${locationName}. Stylr SA is your trusted platform for finding and booking beauty services with ${salonCount} verified salons and independent professionals ready to serve you.

Skip the hassle of endless searching and phone calls. Our platform lets you browse portfolios, read verified reviews, check real-time availability, and book appointments 24/7. Whether you need same-day service or want to plan ahead, finding the right professional in ${cityName} has never been easier.

${avgPrice ? `With competitive pricing starting from R${avgPrice.toFixed(0)}, ` : ''}you'll find options for every budget without compromising on quality. All professionals on our platform are verified, insured, and committed to delivering exceptional service. Join thousands of satisfied customers who trust Stylr SA for their beauty needs in ${cityName}.`,

      // Template 3: Local-focused
      `${cityName} is home to some of ${provinceName}'s finest beauty professionals, and Stylr SA brings them all together in one convenient platform. With ${serviceCount} services available from ${salonCount} top-rated providers, finding your perfect ${keyword.keyword} match has never been simpler.

Our platform is designed specifically for the ${cityName} community, featuring local professionals who understand the unique style preferences and beauty trends of ${provinceName}. Browse detailed profiles, view before-and-after photos, read authentic customer reviews, and book appointments that fit your schedule—all from your phone or computer.

${avgPrice ? `Transparent pricing starting from R${avgPrice.toFixed(0)} means no surprises.` : ''} Whether you're a ${cityName} local or just visiting, Stylr SA makes it easy to look and feel your best. Book online now and experience the convenience of modern beauty service booking.`,

      // Template 4: Quality-focused
      `Finding quality ${keyword.keyword} in ${locationName} just got easier. Stylr SA features ${serviceCount} carefully curated services from ${salonCount} verified beauty professionals who meet our strict quality standards. Every provider on our platform is vetted for professionalism, hygiene standards, and customer satisfaction.

What sets us apart is our commitment to transparency and quality. Read detailed reviews from real customers, view comprehensive portfolios showcasing actual work, and compare services side-by-side. Our booking system shows real-time availability, making it simple to find appointments that work with your schedule.

${avgPrice ? `With services starting from R${avgPrice.toFixed(0)}, ` : ''}${cityName} offers excellent value for professional beauty services. Whether you're looking for a trusted regular provider or trying something new, our platform helps you make informed decisions. Book your ${keyword.keyword} appointment today and discover why thousands of ${provinceName} residents trust Stylr SA.`,

      // Template 5: Convenience-focused
      `Book ${keyword.keyword} in ${locationName} with just a few taps. Stylr SA streamlines your beauty booking experience with ${serviceCount} services from ${salonCount} professional providers, all available for instant online booking. No more phone tag or waiting for callbacks—see availability and book immediately.

Our platform is built for modern life. Browse services during your commute, book appointments during your lunch break, and manage everything from your phone. Get instant booking confirmations, receive appointment reminders, and even reschedule if plans change. It's beauty booking designed for your busy lifestyle.

${avgPrice ? `Competitive pricing from R${avgPrice.toFixed(0)} ` : 'Transparent pricing '}ensures you know exactly what to expect. Compare options, read reviews, and choose the perfect provider for your needs—all in ${cityName}. Join the growing community of ${provinceName} residents who've simplified their beauty routine with Stylr SA.`,
    ];

    return templates[templateIndex].trim();
  }

  /**
   * Generate related service links (internal linking)
   * Returns links to other services in the same location
   */
  async generateRelatedServices(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 10,
  ): Promise<RelatedLink[]> {
    this.logger.debug(
      `Generating related services for ${keyword.keyword} in ${location.name}`,
    );

    // Get other keywords in same category, exclude current keyword
    const relatedKeywords = await this.prisma.seoKeyword.findMany({
      where: {
        category: keyword.category,
        id: { not: keyword.id },
      },
      orderBy: [
        { priority: 'asc' },
        { searchVolume: 'desc' },
      ],
      take: limit,
    });

    const links: RelatedLink[] = await Promise.all(
      relatedKeywords.map(async (relatedKeyword) => ({
        label: `${relatedKeyword.keyword} in ${location.name}`,
        url: await this.buildUrl(relatedKeyword.slug, location),
        type: 'service' as const,
      })),
    );

    this.logger.debug(`Generated ${links.length} related service links`);
    return links;
  }

  /**
   * Generate nearby location links (internal linking)
   * Returns links to the same service in nearby locations
   */
  async generateNearbyLocations(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 10,
  ): Promise<RelatedLink[]> {
    this.logger.debug(
      `Generating nearby locations for ${keyword.keyword} in ${location.name}`,
    );

    let nearbyLocations: SeoLocation[] = [];

    // Strategy 1: If location has coordinates, find nearby by distance
    if (location.latitude && location.longitude) {
      nearbyLocations = await this.getNearbyLocationsByDistance(location, limit);
    }

    // Strategy 2: If it's a suburb, get other suburbs in same city
    if (
      nearbyLocations.length < limit &&
      (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
      location.parentLocationId
    ) {
      const siblings = await this.prisma.seoLocation.findMany({
        where: {
          parentLocationId: location.parentLocationId,
          id: { not: location.id },
        },
        orderBy: [
          { population: 'desc' },
          { name: 'asc' },
        ],
        take: limit - nearbyLocations.length,
      });
      nearbyLocations.push(...siblings);
    }

    // Strategy 3: Get other cities/towns in same province
    if (nearbyLocations.length < limit) {
      const samProvince = await this.prisma.seoLocation.findMany({
        where: {
          provinceSlug: location.provinceSlug,
          id: { not: location.id },
          type: {
            in: ['CITY', 'TOWN'],
          },
        },
        orderBy: [
          { population: 'desc' },
          { salonCount: 'desc' },
        ],
        take: limit - nearbyLocations.length,
      });
      nearbyLocations.push(...samProvince);
    }

    const links: RelatedLink[] = await Promise.all(
      nearbyLocations.map(async (nearbyLocation) => ({
        label: `${keyword.keyword} in ${nearbyLocation.name}`,
        url: await this.buildUrl(keyword.slug, nearbyLocation),
        type: 'location' as const,
      })),
    );

    this.logger.debug(`Generated ${links.length} nearby location links`);
    return links;
  }

  /**
   * Helper: Get nearby locations by geographic distance
   */
  private async getNearbyLocationsByDistance(
    location: SeoLocation,
    limit: number,
  ): Promise<SeoLocation[]> {
    const lat = Number(location.latitude);
    const lon = Number(location.longitude);

    // Get all locations in same province with coordinates
    const candidates = await this.prisma.seoLocation.findMany({
      where: {
        provinceSlug: location.provinceSlug,
        id: { not: location.id },
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calculate distances and sort
    const locationsWithDistance = candidates
      .map(candidate => {
        const distance = this.calculateDistance(
          lat,
          lon,
          Number(candidate.latitude),
          Number(candidate.longitude),
        );
        return { location: candidate, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.location);

    return locationsWithDistance;
  }

  /**
   * Helper: Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Helper: Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate Schema.org JSON-LD markup
   * Enhanced with images for rich results in Google Search
   */
  generateSchema(page: SEOPageData, featuredImage?: string): SchemaMarkup {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.stylrsa.co.za';
    const fullUrl = `${baseUrl}${page.url}`;

    // Default OG image or category-specific image
    const pageImage = featuredImage || `${baseUrl}/og-images/${page.keyword.slug}.jpg`;
    const fallbackImage = `${baseUrl}/og-default.jpg`;

    const schema: SchemaMarkup = {
      '@context': 'https://schema.org',
      '@graph': [],
    };

    // 1. Organization schema
    schema['@graph'].push({
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Stylr SA',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
      },
      sameAs: [
        'https://www.facebook.com/stylrsa',
        'https://www.instagram.com/stylrsa',
        'https://twitter.com/stylrsa',
      ],
    });

    // 2. WebSite schema
    schema['@graph'].push({
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Stylr SA',
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    // 3. BreadcrumbList schema
    const breadcrumbItems = page.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${baseUrl}${crumb.url}`,
    }));

    schema['@graph'].push({
      '@type': 'BreadcrumbList',
      '@id': `${fullUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    });

    // 4. WebPage schema with primaryImageOfPage
    schema['@graph'].push({
      '@type': 'WebPage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: page.metaTitle,
      description: page.metaDescription,
      isPartOf: {
        '@id': `${baseUrl}/#website`,
      },
      breadcrumb: {
        '@id': `${fullUrl}#breadcrumb`,
      },
      inLanguage: 'en-ZA',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        '@id': `${fullUrl}#primaryimage`,
        url: pageImage,
        width: 1200,
        height: 630,
        caption: `${page.keyword.keyword} in ${page.location.name}`,
      },
      thumbnailUrl: pageImage,
    });

    // 5. Service schema (helps with rich results for service-based searches)
    schema['@graph'].push({
      '@type': 'Service',
      '@id': `${fullUrl}#service`,
      name: `${page.keyword.keyword} in ${page.location.name}`,
      description: page.metaDescription,
      provider: {
        '@id': `${baseUrl}/#organization`,
      },
      areaServed: {
        '@type': 'Place',
        name: page.location.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: page.location.name,
          addressRegion: page.location.province,
          addressCountry: 'ZA',
        },
      },
      image: pageImage,
      ...(page.avgPrice && {
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: page.avgPrice,
            priceCurrency: 'ZAR',
            minPrice: Math.round(page.avgPrice * 0.5),
          },
        },
      }),
    });

    // 6. ItemList schema for services (if services exist)
    if (page.serviceCount > 0) {
      schema['@graph'].push({
        '@type': 'ItemList',
        '@id': `${fullUrl}#servicelist`,
        name: `${page.keyword.keyword} in ${page.location.name}`,
        description: `List of ${page.serviceCount} ${page.keyword.keyword} services available in ${page.location.name}`,
        numberOfItems: page.serviceCount,
        mainEntityOfPage: fullUrl,
        itemListElement: page.relatedServices.slice(0, 5).map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}${service.url}`,
          name: service.label,
        })),
      });
    }

    // 7. FAQPage schema (helps get FAQ rich results)
    schema['@graph'].push({
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: `How much does ${page.keyword.keyword} cost in ${page.location.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: page.avgPrice
              ? `${page.keyword.keyword} in ${page.location.name} typically costs from R${Math.round(page.avgPrice * 0.5)} to R${Math.round(page.avgPrice * 1.5)}, with an average price of R${Math.round(page.avgPrice)}.`
              : `Prices for ${page.keyword.keyword} in ${page.location.name} vary. Compare ${page.serviceCount}+ services on Stylr SA to find the best rates.`,
          },
        },
        {
          '@type': 'Question',
          name: `How do I book ${page.keyword.keyword} in ${page.location.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `You can book ${page.keyword.keyword} in ${page.location.name} online through Stylr SA. Browse ${page.serviceCount}+ verified professionals, compare prices and reviews, then book instantly with just a few clicks.`,
          },
        },
        {
          '@type': 'Question',
          name: `Are ${page.keyword.keyword} providers in ${page.location.name} verified?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Yes! All ${page.keyword.keyword} providers listed on Stylr SA are verified. We check credentials, reviews, and service quality to ensure you get the best experience in ${page.location.name}.`,
          },
        },
      ],
    });

    return schema;
  }

  /**
   * Generate breadcrumbs for the page
   */
  async generateBreadcrumbs(
    keyword: SeoKeyword,
    location: SeoLocation,
    locationHierarchy?: SeoLocation[],
  ): Promise<Breadcrumb[]> {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/' },
      { label: keyword.keyword, url: `/${keyword.slug}` },
    ];

    // If we have location hierarchy, use it
    if (locationHierarchy && locationHierarchy.length > 0) {
      locationHierarchy.forEach(loc => {
        breadcrumbs.push({
          label: loc.name,
          url: `/${keyword.slug}/${loc.provinceSlug}${loc.type !== 'PROVINCE' ? `/${loc.slug}` : ''}`,
        });
      });
    } else {
      // Build breadcrumbs from current location
      if (location.type === 'PROVINCE') {
        breadcrumbs.push({
          label: location.name,
          url: `/${keyword.slug}/${location.provinceSlug}`,
        });
      } else {
        // Add province
        breadcrumbs.push({
          label: location.province,
          url: `/${keyword.slug}/${location.provinceSlug}`,
        });

        if (
          (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
          location.parentLocationId
        ) {
          const parentLocation = await this.getParentLocation(
            location.parentLocationId,
          );

          if (parentLocation) {
            breadcrumbs.push({
              label: parentLocation.name,
              url: `/${keyword.slug}/${location.provinceSlug}/${parentLocation.slug}`,
            });
          }
        }

        breadcrumbs.push({
          label: location.name,
          url: await this.buildUrl(keyword.slug, location),
        });
      }
    }

    return breadcrumbs;
  }

  /**
   * Build URL for keyword + location combination
   */
  async buildUrl(keywordSlug: string, location: SeoLocation): Promise<string> {
    // Format: /[keyword]/[province]/[city] or /[keyword]/[province]/[city]/[suburb]
    const parts = [keywordSlug, location.provinceSlug];

    if (location.type === 'PROVINCE') {
      // Province-level: /keyword/province
      return `/${parts.join('/')}`;
    }

    // Add city/town slug
    parts.push(location.slug);

    // If it's a suburb, we need to include parent city
    if (
      (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
      location.parentLocationId
    ) {
      const parentLocation = await this.getParentLocation(
        location.parentLocationId,
      );

      if (parentLocation) {
        parts.splice(2, 0, parentLocation.slug);
      }
    }

    return `/${parts.join('/')}`;
  }

  /**
   * Fetch services filtered by keyword category and location
   */
  async fetchServices(
    keyword: SeoKeyword,
    location: SeoLocation,
    limit: number = 20,
  ): Promise<any[]> {
    this.logger.debug(
      `Fetching services for ${keyword.keyword} in ${location.name}`,
    );

    // Build location filter based on location type
    const locationFilter: any = {};

    try {
      if (location.type === 'PROVINCE') {
        locationFilter.province = location.name;
      } else if (location.type === 'CITY' || location.type === 'TOWN') {
        locationFilter.city = location.name;
        locationFilter.province = location.province;
      } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
        locationFilter.town = location.name;
        locationFilter.province = location.province;
      }

      // Fetch services with salon information
      const services = await this.prisma.service.findMany({
        where: {
          approvalStatus: 'APPROVED',
          salon: {
            approvalStatus: 'APPROVED',
            ...locationFilter,
          },
        },
        include: {
          salon: {
            select: {
              id: true,
              name: true,
              city: true,
              province: true,
              avgRating: true,
              visibilityWeight: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { salon: { visibilityWeight: 'desc' } },
          { salon: { avgRating: 'desc' } },
          { createdAt: 'desc' },
        ],
        take: limit,
      });

      this.logger.debug(`Found ${services.length} services`);
      return services;
    } catch (error) {
      this.logger.error(`Error fetching services: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch salons filtered by location
   */
  async fetchSalons(location: SeoLocation, limit: number = 20): Promise<any[]> {
    this.logger.debug(`Fetching salons in ${location.name}`);

    try {
      // Build location filter based on location type
      const locationFilter: any = {};

      if (location.type === 'PROVINCE') {
        locationFilter.province = location.name;
      } else if (location.type === 'CITY' || location.type === 'TOWN') {
        locationFilter.city = location.name;
        locationFilter.province = location.province;
      } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
        locationFilter.town = location.name;
        locationFilter.province = location.province;
      }

      const salons = await this.prisma.salon.findMany({
        where: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
        select: {
          id: true,
          name: true,
          description: true,
          city: true,
          province: true,
          town: true,
          avgRating: true,
          visibilityWeight: true,
          logo: true,
          heroImages: true,
          _count: {
            select: {
              services: {
                where: {
                  approvalStatus: 'APPROVED',
                },
              },
            },
          },
        },
        orderBy: [
          { visibilityWeight: 'desc' },
          { avgRating: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });

      this.logger.debug(`Found ${salons.length} salons`);
      return salons;
    } catch (error) {
      this.logger.error(`Error fetching salons: ${error.message}`);
      return [];
    }
  }

  /**
   * Get service count for keyword and location
   */
  async getServiceCount(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<number> {
    try {
      const locationFilter: any = {};

      if (location.type === 'PROVINCE') {
        locationFilter.province = location.name;
      } else if (location.type === 'CITY' || location.type === 'TOWN') {
        locationFilter.city = location.name;
        locationFilter.province = location.province;
      } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
        locationFilter.town = location.name;
        locationFilter.province = location.province;
      }

      const count = await this.prisma.service.count({
        where: {
          approvalStatus: 'APPROVED',
          salon: {
            approvalStatus: 'APPROVED',
            ...locationFilter,
          },
        },
      });

      return count;
    } catch (error) {
      this.logger.error(`Error counting services: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get salon count for location
   */
  async getSalonCount(location: SeoLocation): Promise<number> {
    try {
      const locationFilter: any = {};

      if (location.type === 'PROVINCE') {
        locationFilter.province = location.name;
      } else if (location.type === 'CITY' || location.type === 'TOWN') {
        locationFilter.city = location.name;
        locationFilter.province = location.province;
      } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
        locationFilter.town = location.name;
        locationFilter.province = location.province;
      }

      const count = await this.prisma.salon.count({
        where: {
          approvalStatus: 'APPROVED',
          ...locationFilter,
        },
      });

      return count;
    } catch (error) {
      this.logger.error(`Error counting salons: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get average price for services in keyword category and location
   */
  async getAvgPrice(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<number | undefined> {
    try {
      const locationFilter: any = {};

      if (location.type === 'PROVINCE') {
        locationFilter.province = location.name;
      } else if (location.type === 'CITY' || location.type === 'TOWN') {
        locationFilter.city = location.name;
        locationFilter.province = location.province;
      } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
        locationFilter.town = location.name;
        locationFilter.province = location.province;
      }

      const result = await this.prisma.service.aggregate({
        where: {
          approvalStatus: 'APPROVED',
          salon: {
            approvalStatus: 'APPROVED',
            ...locationFilter,
          },
        },
        _avg: {
          price: true,
        },
      });

      return result._avg.price || undefined;
    } catch (error) {
      this.logger.error(`Error calculating avg price: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Helper: Hash location ID to get consistent template selection
   */
  private hashLocationId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Helper: Get location display name with province
   */
  private getLocationDisplayName(location: SeoLocation): string {
    if (location.type === 'PROVINCE') {
      return location.name;
    }

    // For cities/towns/suburbs: "City, Province"
    return `${location.name}, ${location.province}`;
  }

  /**
   * Generate complete page data for a keyword and location
   */
  async generatePageData(
    keyword: SeoKeyword,
    location: SeoLocation,
  ): Promise<SEOPageData> {
    this.logger.debug(
      `Generating page data for ${keyword.keyword} in ${location.name}`,
    );

    try {
      const cacheKey = this.getCacheKey(keyword, location);
      const cachedPage = this.getCached(cacheKey);
      if (cachedPage) {
        return cachedPage;
      }

      // Get counts and stats with fallbacks
      let serviceCount = 0;
      let salonCount = 0;
      let avgPrice: number | undefined;

      try {
        serviceCount = await this.getServiceCount(keyword, location);
      } catch (error) {
        this.logger.warn(`Failed to get service count: ${error.message}`);
      }

      try {
        salonCount = await this.getSalonCount(location);
      } catch (error) {
        this.logger.warn(`Failed to get salon count: ${error.message}`);
      }

      try {
        avgPrice = await this.getAvgPrice(keyword, location);
      } catch (error) {
        this.logger.warn(`Failed to get avg price: ${error.message}`);
      }

      // Generate content with CTR-optimized meta tags
      const h1 = this.generateH1(keyword, location);
      const h2Headings = this.generateH2Headings(keyword, location, serviceCount);
      const h3Headings = this.generateH3Headings(keyword, location);
      const metaTitle = this.generateMetaTitle(keyword, location, serviceCount);
      const metaDescription = this.generateMetaDescription(keyword, location, serviceCount, avgPrice);
      const introText = this.generateIntroText(keyword, location, serviceCount, salonCount, avgPrice);

      // Generate links with fallbacks
      let relatedServices: RelatedLink[] = [];
      let nearbyLocations: RelatedLink[] = [];

      try {
        relatedServices = await this.generateRelatedServices(keyword, location);
      } catch (error) {
        this.logger.warn(`Failed to generate related services: ${error.message}`);
      }

      try {
        nearbyLocations = await this.generateNearbyLocations(keyword, location);
      } catch (error) {
        this.logger.warn(`Failed to generate nearby locations: ${error.message}`);
      }

      // Generate breadcrumbs
      const breadcrumbs = await this.generateBreadcrumbs(keyword, location);

      // Build URL
      const url = await this.buildUrl(keyword.slug, location);

      const pageData: SEOPageData = {
        keyword,
        location,
        url,
        h1,
        h2Headings,
        h3Headings,
        introText,
        metaTitle,
        metaDescription,
        breadcrumbs,
        relatedServices,
        nearbyLocations,
        serviceCount,
        salonCount,
        avgPrice,
      };

      this.setCache(cacheKey, pageData);
      this.logger.debug(`Generated page data for ${url}`);
      return pageData;
    } catch (error) {
      this.logger.error(`Failed to generate page data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}

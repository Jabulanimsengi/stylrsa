import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

interface SitemapLocation {
  slug: string;
  provinceSlug: string;
  type: string;
  population: number | null;
  salonCount: number;
  serviceCount: number;
  parentLocationId: string | null;
  parentLocation?: {
    slug: string;
  } | null;
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  private readonly URLS_PER_SITEMAP = 50000;
  private readonly BASE_URL =
    process.env.FRONTEND_URL || 'https://www.stylrsa.co.za';

  // Cache for locations to avoid DB hits on every request
  private locationsCache: SitemapLocation[] | null = null;
  private lastLocationsFetch = 0;
  private readonly LOCATIONS_CACHE_TTL = 1000 * 60 * 60; // 1 hour

  // Cache for generated sitemaps
  private sitemapCache = new Map<number, { xml: string; timestamp: number }>();
  private readonly SITEMAP_CACHE_TTL = 1000 * 60 * 60; // 1 hour

  constructor(private prisma: PrismaService) { }

  /**
   * Generate sitemap index XML
   * Lists all paginated sitemaps including static pages, salons, services, and SEO pages
   */
  async generateSitemapIndex(): Promise<string> {
    this.logger.log('Generating sitemap index');

    // Calculate total possible URLs from keywords × locations
    const keywordCount = await this.prisma.seoKeyword.count();
    const locations = this.getIndexableLocations(await this.getLocations());
    const locationCount = locations.length;
    const totalUrls = keywordCount * locationCount;
    const totalSitemaps = Math.ceil(totalUrls / this.URLS_PER_SITEMAP);

    this.logger.log(
      `Total possible URLs: ${totalUrls} (${keywordCount} keywords × ${locationCount} locations), Total sitemaps: ${totalSitemaps}`,
    );

    // Build sitemap index XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml +=
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${this.BASE_URL}/sitemap-static.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // Add salons sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${this.BASE_URL}/sitemap-salons.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // Add services sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${this.BASE_URL}/sitemap-services.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // Add trends sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${this.BASE_URL}/sitemap-trends.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';

    // Add SEO pages sitemaps
    for (let i = 0; i < totalSitemaps; i++) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.BASE_URL}/sitemap-seo-${i}.xml</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';

    return xml;
  }

  /**
   * Generate a paginated sitemap XML for SEO pages
   * @param segment - The sitemap segment number (0, 1, 2, etc.)
   */
  async generateSitemap(segment: number): Promise<string> {
    const { totalSitemaps } = await this.getSeoSitemapCounts();
    if (segment >= totalSitemaps) {
      throw new NotFoundException(`Sitemap segment ${segment} does not exist`);
    }

    // Check cache first
    const cached = this.sitemapCache.get(segment);
    if (cached && Date.now() - cached.timestamp < this.SITEMAP_CACHE_TTL) {
      this.logger.log(`Serving cached sitemap for segment ${segment}`);
      return cached.xml;
    }

    this.logger.log(`Generating SEO sitemap segment ${segment}`);

    const skip = segment * this.URLS_PER_SITEMAP;
    const urls = await this.getAllSEOUrls(skip, this.URLS_PER_SITEMAP);

    this.logger.log(`Retrieved ${urls.length} URLs for segment ${segment}`);

    if (urls.length === 0) {
      throw new NotFoundException(`Sitemap segment ${segment} is empty`);
    }

    const xml = this.buildSitemapXml(urls);

    // Cache the result
    this.sitemapCache.set(segment, { xml, timestamp: Date.now() });

    return xml;
  }

  /**
   * Generate static pages sitemap
   */
  async generateStaticSitemap(): Promise<string> {
    this.logger.log('Generating static pages sitemap');

    const now = new Date().toISOString();
    const staticPages: SitemapUrl[] = [
      { loc: '/', lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: '/about', lastmod: now, changefreq: 'monthly', priority: '0.8' },
      { loc: '/contact', lastmod: now, changefreq: 'monthly', priority: '0.8' },
      { loc: '/salons', lastmod: now, changefreq: 'daily', priority: '0.9' },
      { loc: '/services', lastmod: now, changefreq: 'daily', priority: '0.9' },
      { loc: '/trends', lastmod: now, changefreq: 'daily', priority: '0.8' },
      { loc: '/blog', lastmod: now, changefreq: 'weekly', priority: '0.7' },
      { loc: '/privacy', lastmod: now, changefreq: 'monthly', priority: '0.5' },
      { loc: '/terms', lastmod: now, changefreq: 'monthly', priority: '0.5' },
    ];

    return this.buildSitemapXml(staticPages);
  }

  /**
   * Generate salons sitemap
   */
  async generateSalonsSitemap(): Promise<string> {
    this.logger.log('Generating salons sitemap');

    const salons = await this.prisma.salon.findMany({
      where: { approvalStatus: 'APPROVED' },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        avgRating: true,
      },
      orderBy: [{ avgRating: 'desc' }, { updatedAt: 'desc' }],
      take: 10000, // Limit to prevent huge sitemaps
    });

    const urls: SitemapUrl[] = salons.map((salon) => ({
      loc: `/salons/${salon.slug || salon.id}`,
      lastmod: salon.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: this.calculateSalonPriority(salon),
    }));

    this.logger.log(`Generated ${urls.length} salon URLs`);
    return this.buildSitemapXml(urls);
  }

  /**
   * Generate services sitemap
   */
  async generateServicesSitemap(): Promise<string> {
    this.logger.log('Generating services sitemap');

    const services = await this.prisma.service.findMany({
      where: {
        salon: {
          approvalStatus: 'APPROVED',
        },
        approvalStatus: 'APPROVED',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        salonId: true,
        salon: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10000,
    });

    const urls: SitemapUrl[] = services.map((service) => ({
      loc: `/salons/${service.salon?.slug || service.salonId}/services/${slugify(service.title || 'beauty-service') || 'beauty-service'}-${service.id}`,
      lastmod: service.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.6',
    }));

    this.logger.log(`Generated ${urls.length} service URLs`);
    return this.buildSitemapXml(urls);
  }

  /**
   * Generate trends sitemap
   */
  async generateTrendsSitemap(): Promise<string> {
    this.logger.log('Generating trends sitemap');

    const trends = await this.prisma.trend.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    });

    const urls: SitemapUrl[] = trends.map((trend) => ({
      loc: `/trends/${trend.id}`,
      lastmod: trend.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    }));

    this.logger.log(`Generated ${urls.length} trend URLs`);
    return this.buildSitemapXml(urls);
  }

  /**
   * Build sitemap XML from URLs
   */
  private buildSitemapXml(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // If no URLs, add at least the homepage to avoid empty sitemap error
    if (urls.length === 0) {
      xml += '  <url>\n';
      xml += `    <loc>${this.BASE_URL}/</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += '  </url>\n';
    } else {
      for (const url of urls) {
        xml += '  <url>\n';
        xml += `    <loc>${this.BASE_URL}${url.loc}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';
    return xml;
  }

  /**
   * Calculate priority for salon based on rating
   */
  private calculateSalonPriority(salon: {
    avgRating: number | null;
  }): string {
    let priority = 0.6; // Base priority

    // Boost based on rating
    if (salon.avgRating && salon.avgRating >= 4.5) {
      priority += 0.3;
    } else if (salon.avgRating && salon.avgRating >= 4.0) {
      priority += 0.2;
    } else if (salon.avgRating && salon.avgRating >= 3.5) {
      priority += 0.1;
    }

    return Math.min(priority, 1.0).toFixed(2);
  }

  /**
   * Get cached locations
   */
  private async getLocations(): Promise<SitemapLocation[]> {
    if (
      this.locationsCache &&
      Date.now() - this.lastLocationsFetch < this.LOCATIONS_CACHE_TTL
    ) {
      return this.locationsCache;
    }

    this.logger.log('Fetching locations from DB for sitemap generation');
    this.locationsCache = await this.prisma.seoLocation.findMany({
      where: {
        OR: [
          { type: 'PROVINCE' },
          { salonCount: { gt: 0 } },
          { serviceCount: { gt: 0 } },
        ],
      },
      orderBy: [{ population: 'desc' }, { name: 'asc' }],
      select: {
        slug: true,
        provinceSlug: true,
        type: true,
        population: true,
        salonCount: true,
        serviceCount: true,
        parentLocationId: true,
        parentLocation: {
          select: {
            slug: true,
          },
        },
      },
    });
    this.lastLocationsFetch = Date.now();
    return this.locationsCache || [];
  }

  /**
   * Get all SEO URLs with OPTIMIZED pagination
   * Calculates specific keywords needed instead of generating all combinations
   */
  async getAllSEOUrls(skip: number, limit: number): Promise<SitemapUrl[]> {
    // 1. Fetch all locations to calculate pagination
    // Use cached locations to improve performance
    const locations = this.getIndexableLocations(await this.getLocations());

    const locationCount = locations.length;
    if (locationCount === 0) return [];

    // 2. Calculate which keywords correspond to the requested skip/limit
    // We skip entire blocks of (1 keyword * all locations)
    const keywordSkip = Math.floor(skip / locationCount);

    // Calculate how many keywords we need to fetch to cover the limit
    // Plus 1 to handle starting in the middle of a keyword's location list
    const keywordTake = Math.ceil(limit / locationCount) + 1;

    const keywords = await this.prisma.seoKeyword.findMany({
      orderBy: [{ priority: 'asc' }, { searchVolume: 'desc' }],
      select: {
        slug: true,
        priority: true,
        searchVolume: true,
      },
      skip: keywordSkip,
      take: keywordTake,
    });

    const urls: SitemapUrl[] = [];
    const now = new Date().toISOString();

    // 3. Calculate the starting offset within the first keyword
    // (e.g., if we skipped 2.5 keywords, we start at index 50% of 3rd keyword)
    let locationIndex = skip % locationCount;

    for (const keyword of keywords) {
      // Iterate through locations for this keyword
      for (let i = locationIndex; i < locations.length; i++) {
        if (urls.length >= limit) break;

        const location = locations[i];

        const url = this.buildSeoLocationUrl(keyword.slug, location);

        if (!url) {
          continue;
        }

        urls.push({
          loc: url,
          lastmod: now,
          changefreq: this.calculateChangeFreq(keyword, location),
          priority: this.calculatePriority(keyword, location),
        });
      }

      // Reset location index for subsequent keywords (they always start at 0)
      locationIndex = 0;

      if (urls.length >= limit) break;
    }

    return urls;
  }

  /**
   * Calculate priority based on keyword tier and location importance
   * Priority scale: 0.0 to 1.0
   */
  private calculatePriority(keyword: any, location: any): string {
    let priority = 0.5; // Base priority

    // Keyword priority (Tier 1 = highest)
    if (keyword.priority === 1) {
      priority += 0.3; // Tier 1: +0.3
    } else if (keyword.priority === 2) {
      priority += 0.2; // Tier 2: +0.2
    } else {
      priority += 0.1; // Tier 3: +0.1
    }

    // Location type importance
    if (location.type === 'PROVINCE') {
      priority += 0.1; // Province pages are important
    } else if (location.type === 'CITY' || location.type === 'TOWN') {
      priority += 0.05; // City pages are moderately important
    } else if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      priority += 0.02; // Deep local pages matter when they have real inventory
    }

    // Population bonus (if available)
    if (location.population) {
      if (location.population > 1000000) {
        priority += 0.05; // Major cities
      } else if (location.population > 100000) {
        priority += 0.03; // Large cities
      }
    }

    // Cap at 1.0
    priority = Math.min(priority, 1.0);

    return priority.toFixed(2);
  }

  /**
   * Calculate change frequency based on keyword and location
   */
  private calculateChangeFreq(
    keyword: any,
    location: any,
  ): 'daily' | 'weekly' | 'monthly' {
    // High-priority keywords and major locations change more frequently
    if (keyword.priority === 1) {
      if (
        location.type === 'PROVINCE' ||
        (location.population && location.population > 500000)
      ) {
        return 'daily'; // Top keywords in major areas
      }
      return 'weekly'; // Top keywords in smaller areas
    }

    if (keyword.priority === 2) {
      return 'weekly'; // Mid-tier keywords
    }

    return 'monthly'; // Long-tail keywords
  }

  /**
   * Get sitemap statistics
   */
  async getSitemapStats(): Promise<{
    keywordCount: number;
    totalUrls: number;
    totalSitemaps: number;
    cachedUrls: number;
    eligibleLocations: number;
    lastGenerated: Date | null;
  }> {
    const { keywordCount, locationCount, totalUrls, totalSitemaps } =
      await this.getSeoSitemapCounts();
    const cachedUrls = await this.prisma.seoPageCache.count();

    // Get the most recent page generation date
    const latestPage = await this.prisma.seoPageCache.findFirst({
      orderBy: { lastGenerated: 'desc' },
      select: { lastGenerated: true },
    });

    return {
      keywordCount,
      totalUrls,
      totalSitemaps,
      cachedUrls,
      eligibleLocations: locationCount,
      lastGenerated: latestPage?.lastGenerated || null,
    };
  }

  private buildSeoLocationUrl(
    keywordSlug: string,
    location: SitemapLocation,
  ): string | null {
    if (location.type === 'PROVINCE') {
      return `/${keywordSlug}/${location.provinceSlug}`;
    }

    if (
      (location.type === 'SUBURB' || location.type === 'TOWNSHIP') &&
      location.parentLocation?.slug
    ) {
      return `/${keywordSlug}/${location.provinceSlug}/${location.parentLocation.slug}/${location.slug}`;
    }

    if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      return null;
    }

    return `/${keywordSlug}/${location.provinceSlug}/${location.slug}`;
  }

  private getIndexableLocations(
    locations: SitemapLocation[],
  ): SitemapLocation[] {
    return locations.filter((location) => this.isIndexableLocation(location));
  }

  private isIndexableLocation(location: SitemapLocation): boolean {
    if (location.type === 'PROVINCE') {
      return true;
    }

    if (location.type === 'CITY' || location.type === 'TOWN') {
      return true;
    }

    if (location.type === 'SUBURB' || location.type === 'TOWNSHIP') {
      return Boolean(location.parentLocation?.slug);
    }

    return false;
  }

  private async getSeoSitemapCounts(): Promise<{
    keywordCount: number;
    locationCount: number;
    totalUrls: number;
    totalSitemaps: number;
  }> {
    const keywordCount = await this.prisma.seoKeyword.count();
    const locations = this.getIndexableLocations(await this.getLocations());
    const locationCount = locations.length;
    const totalUrls = keywordCount * locationCount;
    const totalSitemaps = Math.ceil(totalUrls / this.URLS_PER_SITEMAP);

    return {
      keywordCount,
      locationCount,
      totalUrls,
      totalSitemaps,
    };
  }
}

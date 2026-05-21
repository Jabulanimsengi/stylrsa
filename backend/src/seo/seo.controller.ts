import { BadRequestException, Controller, Get, Param, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly sitemapService: SitemapService) {}

  /**
   * Get sitemap index
   * GET /seo/sitemap-index
   */
  @Get('sitemap-index')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSitemapIndex(): Promise<string> {
    return await this.sitemapService.generateSitemapIndex();
  }

  /**
   * Get static pages sitemap
   * GET /seo/sitemap-static
   */
  @Get('sitemap-static')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getStaticSitemap(): Promise<string> {
    return await this.sitemapService.generateStaticSitemap();
  }

  /**
   * Get salons sitemap
   * GET /seo/sitemap-salons
   */
  @Get('sitemap-salons')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSalonsSitemap(): Promise<string> {
    return await this.sitemapService.generateSalonsSitemap();
  }

  /**
   * Get services sitemap
   * GET /seo/sitemap-services
   */
  @Get('sitemap-services')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getServicesSitemap(): Promise<string> {
    return await this.sitemapService.generateServicesSitemap();
  }

  /**
   * Get trends sitemap
   * GET /seo/sitemap-trends
   */
  @Get('sitemap-trends')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getTrendsSitemap(): Promise<string> {
    return await this.sitemapService.generateTrendsSitemap();
  }

  /**
   * Get paginated SEO sitemap
   * GET /seo/sitemap-seo-:segment
   */
  @Get('sitemap-seo-:segment')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSeoSitemap(@Param('segment') segment: string): Promise<string> {
    const segmentNum = parseInt(segment, 10);
    if (isNaN(segmentNum) || segmentNum < 0) {
      throw new BadRequestException('Invalid segment number');
    }
    return await this.sitemapService.generateSitemap(segmentNum);
  }

  /**
   * Get sitemap statistics
   * GET /seo/sitemap-stats
   */
  @Get('sitemap-stats')
  async getSitemapStats() {
    return await this.sitemapService.getSitemapStats();
  }
}

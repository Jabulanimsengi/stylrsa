import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrendCategory } from '@prisma/client';

// Map TrendCategory to service categories
const TREND_TO_SERVICE_CATEGORY_MAP: Record<TrendCategory, string[]> = {
  HAIRSTYLE: ['Hair Styling', 'Hair Care', 'Haircuts & Styling'],
  BRAIDS: ['Braiding & Weaving', 'Hair Styling', 'Protective Styles'],
  LOCS: ['Hair Styling', 'Hair Care', 'Protective Styles'],
  EXTENSIONS: ['Hair Styling', 'Extensions', 'Weaving'],
  NAILS: ['Nail Care', 'Manicure', 'Pedicure'],
  SPA: ['Spa Treatments', 'Facials', 'Body Treatments', 'Massage & Body Treatments'],
  MAKEUP: ['Makeup', 'Bridal Makeup', 'Special Occasion Makeup'],
  SKINCARE: ['Facials', 'Skincare', 'Spa Treatments'],
  MASSAGE: ['Massage & Body Treatments', 'Spa Treatments', 'Relaxation'],
  BARBERING: ['Barbering', 'Mens Grooming', 'Haircuts & Styling'],
};

@Injectable()
export class TrendsSalonsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get recommended salons for a specific trend
   * Filters by:
   * - Trendz profile enabled
   * - Matching service categories
   * - Proximity (if coordinates provided)
   * - Active and approved salons
   */
  async getRecommendedSalons(
    trendId: string,
    latitude?: number,
    longitude?: number,
    radius: number = 25, // km
  ) {
    // Get the trend
    const trend = await this.prisma.trend.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    // Get service categories related to this trend category
    const relatedCategories = TREND_TO_SERVICE_CATEGORY_MAP[trend.category] || [];

    // Build query filters
    const where: any = {
      approvalStatus: 'APPROVED',
      trendzProfile: {
        isEnabled: true,
        categories: {
          has: trend.category,
        },
      },
    };

    // Proximity filter if coordinates provided
    let salons = await this.prisma.salon.findMany({
      where,
      include: {
        services: {
          where: {
            approvalStatus: 'APPROVED',
          },
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        trendzProfile: {
          select: {
            isPremium: true,
            premiumUntil: true,
            impressions: true,
            clicks: true,
          },
        },
      },
    });

    // Filter by service categories
    salons = salons.filter((salon) => {
      const hasMatchingService = salon.services.some((service) => {
        const categoryName = service.category?.name || '';
        return relatedCategories.some((cat) =>
          categoryName.toLowerCase().includes(cat.toLowerCase()),
        );
      });
      return hasMatchingService;
    });

    // Calculate distance if coordinates provided and apply proximity filtering with fallbacks
    if (latitude && longitude) {
      // Add distance to all salons
      const salonsWithDistance = salons.map((salon) => {
        if (salon.latitude && salon.longitude) {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            salon.latitude,
            salon.longitude,
          );
          return { ...salon, distance };
        }
        return { ...salon, distance: 999999 }; // No coordinates = far away
      });

      // Try to find salons within the specified radius
      let nearbySalons = salonsWithDistance
        .filter((salon) => salon.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      // Fallback 1: If no salons found nearby, expand radius to 50km
      if (nearbySalons.length === 0 && radius < 50) {
        nearbySalons = salonsWithDistance
          .filter((salon) => salon.distance <= 50)
          .sort((a, b) => a.distance - b.distance);
      }

      // Fallback 2: If still no salons, get user's approximate location and find salons in same province/region
      if (nearbySalons.length === 0) {
        // Find the closest salon to determine user's likely province
        const closestSalon = salonsWithDistance
          .filter((salon) => salon.distance < 999999)
          .sort((a, b) => a.distance - b.distance)[0];

        if (closestSalon) {
          // Find salons in the same province as the closest salon
          const sameProvinceSalons = salonsWithDistance
            .filter((salon) => 
              salon.province && 
              closestSalon.province &&
              salon.province.toLowerCase() === closestSalon.province.toLowerCase()
            )
            .sort((a, b) => a.distance - b.distance);

          if (sameProvinceSalons.length > 0) {
            nearbySalons = sameProvinceSalons;
          }
        }
      }

      // Fallback 3: If still no results, return top-rated salons regardless of location
      if (nearbySalons.length === 0) {
        nearbySalons = salonsWithDistance
          .filter((salon) => salon.distance < 999999) // Has coordinates
          .sort((a, b) => {
            // Sort by rating first, then distance
            const ratingDiff = (b.avgRating || 0) - (a.avgRating || 0);
            return ratingDiff !== 0 ? ratingDiff : a.distance - b.distance;
          })
          .slice(0, 10); // Limit to top 10
      }

      salons = nearbySalons;
    }

    // Sort by premium status, then rating, then recency
    salons.sort((a, b) => {
      // Premium salons first
      const aPremium = a.trendzProfile?.isPremium ? 1 : 0;
      const bPremium = b.trendzProfile?.isPremium ? 1 : 0;
      if (aPremium !== bPremium) return bPremium - aPremium;

      // Then by rating
      const aRating = a.avgRating || 0;
      const bRating = b.avgRating || 0;
      if (aRating !== bRating) return bRating - aRating;

      // Then by recency
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Update impressions for each salon
    await Promise.all(
      salons.slice(0, 10).map((salon) =>
        this.prisma.salonTrendzProfile.update({
          where: { salonId: salon.id },
          data: {
            impressions: {
              increment: 1,
            },
          },
        }),
      ),
    );

    return salons.map((salon) => ({
      id: salon.id,
      name: salon.name,
      description: salon.description,
      backgroundImage: salon.backgroundImage,
      logo: salon.logo,
      city: salon.city,
      province: salon.province,
      address: salon.address,
      latitude: salon.latitude,
      longitude: salon.longitude,
      avgRating: 0,
      reviewCount: 0,
      phoneNumber: salon.phoneNumber,
      whatsapp: salon.whatsapp,
      distance: (salon as any).distance,
      services: salon.services.filter((service) => {
        const categoryName = service.category?.name || '';
        return relatedCategories.some((cat) =>
          categoryName.toLowerCase().includes(cat.toLowerCase()),
        );
      }),
      isPremium: salon.trendzProfile?.isPremium || false,
    }));
  }

  /**
   * Track salon click from trend
   */
  async trackSalonClick(trendId: string, salonId: string) {
    await this.prisma.salonTrendzProfile.update({
      where: { salonId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Admin: Enable/Disable salon for Trendz
   */
  async updateSalonTrendzProfile(
    salonId: string,
    data: {
      isEnabled?: boolean;
      categories?: TrendCategory[];
      isPremium?: boolean;
      premiumUntil?: Date;
    },
  ) {
    // Check if profile exists
    const existing = await this.prisma.salonTrendzProfile.findUnique({
      where: { salonId },
    });

    if (existing) {
      return this.prisma.salonTrendzProfile.update({
        where: { salonId },
        data,
      });
    } else {
      return this.prisma.salonTrendzProfile.create({
        data: {
          salonId,
          isEnabled: data.isEnabled ?? false,
          categories: data.categories ?? [],
          isPremium: data.isPremium ?? false,
          premiumUntil: data.premiumUntil,
        },
      });
    }
  }

  /**
   * Admin: Get all salons with Trendz profile info
   */
  async getAllSalonsWithTrendzProfile() {
    const salons = await this.prisma.salon.findMany({
      where: {
        approvalStatus: 'APPROVED',
      },
      include: {
        trendzProfile: true,
        services: {
          where: {
            approvalStatus: 'APPROVED',
          },
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return salons.map((salon) => ({
      id: salon.id,
      name: salon.name,
      city: salon.city,
      province: salon.province,
      avgRating: salon.avgRating,
      serviceCategories: [
        ...new Set(
          salon.services.map((s) => s.category?.name).filter(Boolean),
        ),
      ],
      trendzProfile: salon.trendzProfile || {
        isEnabled: false,
        categories: [],
        isPremium: false,
        impressions: 0,
        clicks: 0,
      },
    }));
  }
}

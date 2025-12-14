// backend/src/salons/salons.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  Req,
} from '@nestjs/common';
import { SalonsService } from './salons.service';
import { CreateSalonDto, UpdateSalonDto, UpdateSalonPlanDto } from './dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt.guard';

@Controller('api/salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) { }

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: any, @Body() createSalonDto: CreateSalonDto) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @UseGuards(JwtGuard)
  @Get('my-salon')
  findMySalon(@GetUser() user: any, @Query('ownerId') ownerId?: string) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findMySalon(user, id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('approved')
  findAllApproved(
    @Query('province') province: string,
    @Query('city') city: string,
    @Query('service') service: string,
    @Query('category') category: string,
    @Query('q') q: string,
    @Query('offersMobile') offersMobile: boolean,
    @Query('sortBy') sortBy: string,
    @Query('openOn') openOn: string,
    @Query('openNow') openNow: string,
    @Query('priceMin') priceMin: string,
    @Query('priceMax') priceMax: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius: string,
    @GetUser() user: any,
  ) {
    return this.salonsService.findAllApproved(
      {
        province,
        city,
        service,
        category,
        q,
        offersMobile,
        sortBy,
        openOn,
        openNow,
        priceMin,
        priceMax,
        lat,
        lon,
        radius,
      },
      user,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('featured')
  findFeatured(@GetUser() user?: any) {
    return this.salonsService.findFeatured(user);
  }

  @UseGuards(JwtGuard)
  @Get('recommended')
  findRecommended(@GetUser() user: any) {
    return this.salonsService.findRecommended(user);
  }

  @Get('aggregate-rating')
  @UseGuards(OptionalJwtAuthGuard)
  getAggregateRating(
    @Query('category') category: string,
    @Query('city') city: string,
    @Query('province') province: string,
  ) {
    return this.salonsService.getAggregateRating(category, city, province);
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.salonsService.findNearby(lat, lon);
  }

  /**
   * Track salon card impression
   * POST /api/salons/:id/impression
   * Fire-and-forget to avoid blocking response when multiple impressions fire simultaneously
   * Must be defined BEFORE the generic :id route to ensure proper route matching
   */
  @Post(':id/impression')
  @UseGuards(OptionalJwtAuthGuard)
  trackImpression(@Param('id') id: string, @GetUser() user?: any, @Req() req?: any) {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress;
    // Fire-and-forget: don't await to avoid blocking when multiple featured salons trigger impressions
    this.salonsService.trackView(id, user?.id, ipAddress).catch((error) => {
      // Silently fail - impression tracking should not disrupt UX
      console.error('Failed to track salon impression:', error);
    });
    // Return immediately to prevent blocking
    return { success: true };
  }

  // Support both UUID and slug lookups for SEO-friendly URLs
  // UUID format: de55643d-89d1-4ffe-9801-d9e3d3c1a0f9
  // Slug format: glamour-hair-studio-johannesburg
  // Must be defined AFTER more specific routes like /impression
  @Get(':idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('idOrSlug') idOrSlug: string, @GetUser() user?: any, @Req() req?: any) {
    // Skip if it matches a static route name
    const staticRoutes = ['approved', 'featured', 'recommended', 'nearby', 'aggregate-rating', 'my-salon', 'mine'];
    if (staticRoutes.includes(idOrSlug)) {
      return null;
    }
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress;
    return this.salonsService.findOne(idOrSlug, user, ipAddress);
  }

  @UseGuards(JwtGuard)
  @Put('mine') // FIX: Changed from @Patch to @Put to match the frontend request
  updateMySalon(
    @GetUser() user: any,
    @Body() updateSalonDto: UpdateSalonDto,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.updateMySalon(user, updateSalonDto, id);
  }

  @UseGuards(JwtGuard)
  @Patch('mine/plan')
  updateMySalonPlan(
    @GetUser() user: any,
    @Body() dto: UpdateSalonPlanDto,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.updatePlan(user, dto, id);
  }

  @UseGuards(JwtGuard)
  @Patch('mine/availability')
  toggleAvailability(@GetUser() user: any, @Query('ownerId') ownerId?: string) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.toggleAvailability(user, id);
  }

  @UseGuards(JwtGuard)
  @Put('mine/booking-message')
  updateBookingMessage(
    @GetUser() user: any,
    @Body('bookingMessage') bookingMessage: string,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.updateBookingMessage(user, bookingMessage, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/bookings')
  findBookingsForMySalon(
    @GetUser() user: any,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findBookingsForMySalon(user, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/services')
  findServicesForMySalon(
    @GetUser() user: any,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findServicesForMySalon(user, id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.salonsService.remove(user, id);
  }
}

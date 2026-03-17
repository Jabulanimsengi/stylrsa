import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingWhatsAppIntentDto } from './dto/create-booking-whatsapp-intent.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('availability/:serviceId')
  getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailability(serviceId, date);
  }

  @Post('whatsapp-intent')
  createWhatsAppIntent(@Body() createBookingWhatsAppIntentDto: CreateBookingWhatsAppIntentDto) {
    return this.bookingsService.createWhatsAppIntent(createBookingWhatsAppIntentDto);
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@GetUser() user: any, @Body() createBookingDto: CreateBookingDto) {
    // FIX: Passing the full 'user' object instead of just user.id
    return this.bookingsService.create(user, createBookingDto);
  }

  @Get('my-bookings')
  @UseGuards(JwtGuard)
  getMyBookings(@GetUser() user: any) {
    // FIX: Corrected method name from 'getUserBookings' to 'findAllForUser'
    return this.bookingsService.findAllForUser(user);
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  updateBookingStatus(
    @GetUser() user: any,
    @Param('id') bookingId: string,
    @Body('status') status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    // FIX: Corrected method name from 'updateBookingStatus' to 'updateStatus'
    return this.bookingsService.updateStatus(user, bookingId, status);
  }
}

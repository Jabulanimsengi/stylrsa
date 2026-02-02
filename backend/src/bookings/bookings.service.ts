import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MailService } from 'src/mail/mail.service';
import { CashbackService, COMMISSION_RATES, DEPOSIT_RATE } from 'src/cashback/cashback.service';

type ServiceWithSalon = any;
type BookingWithServiceAndSalon = any;

export interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private cashbackService: CashbackService,
  ) { }

  /**
   * Get available time slots for a service on a specific date
   */
  async getAvailability(serviceId: string, date: string): Promise<DayAvailability> {
    const service: ServiceWithSalon | null =
      await this.prisma.service.findUnique({
        where: { id: serviceId },
        include: { salon: true },
      });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const salon = service.salon;
    // Parse date string as local date (YYYY-MM-DD format)
    // new Date("2024-01-15") interprets as UTC, so we need to parse it as local
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if salon operates on this day
    if (!salon.operatingDays || !salon.operatingDays.includes(dayOfWeek)) {
      return {
        date,
        slots: [],
      };
    }

    // Get operating hours for the day
    // Handle both array format [{ day: "Monday", open: "09:00", close: "17:00" }]
    // and object format { "Monday": { open: "09:00", close: "17:00" } }
    const operatingHours = salon.operatingHours as any;
    if (!operatingHours) {
      return {
        date,
        slots: [],
      };
    }

    let open: string;
    let close: string;

    if (Array.isArray(operatingHours)) {
      // Array format: [{ day: "Monday", open: "09:00", close: "17:00" }]
      const daySchedule = operatingHours.find(
        (schedule: any) => schedule.day === dayOfWeek,
      );
      if (!daySchedule || !daySchedule.open || !daySchedule.close) {
        return {
          date,
          slots: [],
        };
      }
      open = daySchedule.open;
      close = daySchedule.close;
    } else if (typeof operatingHours === 'object') {
      // Object format: { "Monday": { open: "09:00", close: "17:00" } }
      const daySchedule = operatingHours[dayOfWeek];
      if (!daySchedule || !daySchedule.open || !daySchedule.close) {
        return {
          date,
          slots: [],
        };
      }
      open = daySchedule.open;
      close = daySchedule.close;
    } else {
      return {
        date,
        slots: [],
      };
    }

    // Parse open and close times
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);

    // Create time slots based on service duration
    const serviceDuration = service.duration || 60; // Default to 60 minutes
    const slots: TimeSlot[] = [];

    // Generate slots for the day
    let currentTime = new Date(requestedDate);
    currentTime.setHours(openHour, openMinute, 0, 0);

    const endTime = new Date(requestedDate);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    // Get existing bookings for this service on this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        bookingTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'], // Only count pending and confirmed bookings
        },
      },
    });

    // Generate time slots
    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);

      // Check if slot end time exceeds closing time
      if (slotEndTime > endTime) {
        break;
      }

      // Check if this slot conflicts with any existing booking
      const isBooked = existingBookings.some(booking => {
        const bookingStart = new Date(booking.bookingTime);
        const bookingEnd = new Date(bookingStart.getTime() + serviceDuration * 60000);

        // Check for overlap
        return (
          (currentTime >= bookingStart && currentTime < bookingEnd) ||
          (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
          (currentTime <= bookingStart && slotEndTime >= bookingEnd)
        );
      });

      // Check if slot is in the past
      const now = new Date();
      const isPast = currentTime < now;

      const status = isPast ? 'unavailable' : isBooked ? 'busy' : 'available';

      slots.push({
        time: currentTime.toISOString(),
        available: status === 'available',
        status: status,
      });

      // Move to next slot
      currentTime = new Date(currentTime.getTime() + serviceDuration * 60000);
    }

    return {
      date,
      slots,
    };
  }

  async create(user: any, dto: CreateBookingDto) {
    const service: ServiceWithSalon | null =
      await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
        include: { salon: true },
      });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate that the requested time slot is available
    const bookingDate = new Date(dto.bookingTime);
    const dateString = bookingDate.toISOString().split('T')[0];
    const availability = await this.getAvailability(dto.serviceId, dateString);

    const requestedSlot = availability.slots.find(slot => {
      const slotTime = new Date(slot.time);
      return Math.abs(slotTime.getTime() - bookingDate.getTime()) < 60000; // Within 1 minute
    });

    if (!requestedSlot || !requestedSlot.available) {
      throw new BadRequestException('The requested time slot is not available');
    }

    // Calculate financial breakdown
    const totalCost = service.price;
    const depositAmount = totalCost * DEPOSIT_RATE;
    const commissionAmount = totalCost * COMMISSION_RATES.TOTAL;
    const salonPayout = totalCost - commissionAmount;

    // Handle cashback if requested
    let cashbackUsed = 0;
    if (dto.useCashback && dto.cashbackUsed && dto.cashbackUsed > 0) {
      // Verify user has sufficient cashback balance
      const { balance } = await this.cashbackService.getBalance(user.id);
      if (balance < dto.cashbackUsed) {
        throw new BadRequestException('Insufficient cashback balance');
      }
      cashbackUsed = dto.cashbackUsed;
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: dto.serviceId,
        salonId: service.salonId,
        bookingTime: new Date(dto.bookingTime),
        isMobile: dto.isMobile,
        clientPhone: dto.clientPhone,
        teamMemberId: dto.teamMemberId || null,
        clientNotes: dto.clientNotes || null,
        status: 'PENDING',
        totalCost,
        // New financial fields
        depositAmount,
        depositPaid: dto.depositPaid ?? false,
        commissionAmount,
        salonPayout,
        // Cashback fields
        useCashback: dto.useCashback ?? false,
        cashbackUsed,
        // Customization fields
        colorSelection: dto.colorSelection || null,
        materialSelection: dto.materialSelection || null,
      },
      include: {
        service: true,
        user: true,
        teamMember: true,
      },
    });

    // Deduct cashback if used
    if (cashbackUsed > 0) {
      await this.cashbackService.spendCashback(
        user.id,
        cashbackUsed,
        booking.id,
        `Used on booking at ${service.salon.name}`,
      );
    }

    // Notify salon owner
    const notification = await this.notificationsService.create(
      service.salon.ownerId,
      `New booking for ${service.title} by ${user.firstName}.`,
      {
        bookingId: booking.id,
        link: '/dashboard?tab=bookings',
      },
    );

    this.eventsGateway.sendNotificationToUser(
      service.salon.ownerId,
      'newNotification',
      notification,
    );

    // Notify all admins about the new booking
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true },
    });

    for (const admin of admins) {
      const adminNotification = await this.notificationsService.create(
        admin.id,
        `New booking: ${service.title} at ${service.salon.name} by ${user.firstName} ${user.lastName || ''}`.trim(),
        {
          bookingId: booking.id,
          link: '/admin?tab=bookings',
        },
      );

      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        adminNotification,
      );

      // Send email to admin
      try {
        await this.mailService.notifyAdminNewBooking(
          admin.email,
          admin.firstName,
          `${user.firstName} ${user.lastName || ''}`.trim(),
          user.email,
          service.salon.name,
          service.title,
          bookingDateFormatted,
          bookingTimeFormatted,
          totalCost,
        );
      } catch (error) {
        // Log but don't fail if admin email fails
        console.error('Failed to send admin booking notification email:', error);
      }
    }

    // Send email notifications
    const bookingDateFormatted = bookingDate.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const bookingTimeFormatted = bookingDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

    // Email to user confirming booking request
    await this.mailService.sendBookingConfirmation(
      user.email,
      user.firstName,
      service.salon.name,
      service.title,
      bookingDateFormatted,
      bookingTimeFormatted,
    );

    // Email to salon owner about new booking
    const salonOwner = await this.prisma.user.findUnique({
      where: { id: service.salon.ownerId },
      select: { email: true, firstName: true },
    });
    if (salonOwner) {
      await this.mailService.notifySalonNewBooking(
        salonOwner.email,
        salonOwner.firstName,
        service.salon.name,
        `${user.firstName} ${user.lastName || ''}`.trim(),
        user.email,
        service.title,
        bookingDateFormatted,
        bookingTimeFormatted,
      );
    }

    return booking;
  }

  async findAllForUser(user: any) {
    return this.prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        service: true,
        salon: true,
        review: true,
      },
      orderBy: {
        bookingTime: 'desc',
      },
    });
  }

  async findOne(user: any, id: string) {
    const booking: BookingWithServiceAndSalon | null =
      await this.prisma.booking.findUnique({
        where: { id },
        include: {
          service: {
            include: {
              salon: true,
            },
          },
        },
      });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.userId !== user.id &&
      booking.service.salon.ownerId !== user.id
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this booking',
      );
    }

    return booking;
  }

  async updateStatus(
    user: any,
    id: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            salon: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.service.salon.ownerId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this booking',
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
    });

    // Customize notification message based on status
    let notificationMessage = `Your booking for ${booking.service.title} has been ${status.toLowerCase()}.`;
    let notificationLink = '/my-bookings';

    // Special message for COMPLETED bookings to encourage reviews
    if (status === 'COMPLETED') {
      notificationMessage = `Your booking for ${booking.service.title} at ${booking.service.salon.name} is complete! We'd love to hear about your experience. Please leave a review.`;
      notificationLink = '/my-bookings?action=review';
    }

    const notification = await this.notificationsService.create(
      booking.userId,
      notificationMessage,
      {
        bookingId: booking.id,
        link: notificationLink,
      },
    );

    this.eventsGateway.sendNotificationToUser(
      booking.userId,
      'newNotification',
      notification,
    );

    // Send email notification based on status
    const bookingDateFormatted = booking.bookingTime.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const bookingTimeFormatted = booking.bookingTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

    if (status === 'CONFIRMED') {
      const salonAddress = booking.service.salon.address || '';
      await this.mailService.sendBookingApproved(
        booking.user.email,
        booking.user.firstName,
        booking.service.salon.name,
        booking.service.title,
        bookingDateFormatted,
        bookingTimeFormatted,
        salonAddress,
      );
    } else if (status === 'CANCELLED') {
      await this.mailService.sendBookingRejected(
        booking.user.email,
        booking.user.firstName,
        booking.service.salon.name,
        booking.service.title,
      );
    } else if (status === 'COMPLETED') {
      // Award cashback for completed bookings over R100
      if (booking.totalCost >= 100) {
        await this.cashbackService.awardCashback(
          booking.userId,
          booking.totalCost,
          booking.id,
          `Cashback from ${booking.service.salon.name}`,
        );
      }
    }

    return updatedBooking;
  }

  async remove(user: any, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this booking',
      );
    }

    return this.prisma.booking.delete({ where: { id } });
  }
}

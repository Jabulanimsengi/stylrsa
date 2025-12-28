// backend/src/reviews/reviews.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) { }

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { salon: { select: { name: true } } },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only review your own bookings.');
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findFirst({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this booking.');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images || [],
        author: {
          connect: { id: userId },
        },
        salon: {
          connect: { id: booking.salonId },
        },
        booking: {
          connect: { id: dto.bookingId },
        },
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        booking: { select: { id: true } },
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const authorName = review.author
      ? `${review.author.firstName || ''} ${review.author.lastName || ''}`.trim()
      : 'A user';

    for (const admin of admins) {
      const notification = await this.notificationsService.create(
        admin.id,
        `New review by ${authorName} for salon "${booking.salon.name}" is pending approval.`,
        { link: '/admin?tab=reviews' },
      );
      this.eventsGateway.sendNotificationToUser(
        admin.id,
        'newNotification',
        notification,
      );
    }

    return review;
  }

  async update(reviewId: string, userId: string, dto: CreateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { author: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews.');
    }

    // Only allow editing pending reviews
    if (review.approvalStatus !== 'PENDING') {
      throw new ForbiddenException('You can only edit reviews that are pending approval.');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images || [],
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        booking: { select: { id: true } },
      },
    });

    return updatedReview;
  }

  // NEW: Get all reviews for salon owner's salon
  async getSalonOwnerReviews(userId: string) {
    // Find the salon owned by this user
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!salon) {
      // Return empty arrays instead of throwing error
      // This allows salon owners without a salon yet to see the empty state
      return {
        pending: [],
        approved: [],
        needsResponse: [],
      };
    }

    // Get all reviews for this salon
    const reviews = await this.prisma.review.findMany({
      where: { salonId: salon.id },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    return {
      pending: reviews.filter((r) => r.approvalStatus === 'PENDING'),
      approved: reviews.filter((r) => r.approvalStatus === 'APPROVED'),
      needsResponse: reviews.filter(
        (r) => r.approvalStatus === 'APPROVED' && !r.salonOwnerResponse,
      ),
    };
  }

  // NEW: Respond to a review
  async respondToReview(reviewId: string, userId: string, response: string) {
    // Get the review and verify ownership
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        salon: {
          select: {
            ownerId: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.salon.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only respond to reviews for your own salon.',
      );
    }

    if (review.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException(
        'You can only respond to approved reviews.',
      );
    }

    // Update the review with the response
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        salonOwnerResponse: response.trim(),
        salonOwnerRespondedAt: new Date(),
      },
    });

    // Notify the review author
    const notification = await this.notificationsService.create(
      review.author.id,
      `${review.salon.name} responded to your review.`,
      { link: `/salons/${review.salonId}?highlight=review-${reviewId}` },
    );

    this.eventsGateway.sendNotificationToUser(
      review.author.id,
      'newNotification',
      notification,
    );

    return updated;
  }
}

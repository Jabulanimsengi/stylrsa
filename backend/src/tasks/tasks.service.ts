import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    /**
     * Send appointment reminders for bookings happening tomorrow
     * Runs every day at 10:00 AM
     */
    @Cron('0 10 * * *', {
        name: 'appointment-reminders',
        timeZone: 'Africa/Johannesburg',
    })
    async sendAppointmentReminders() {
        this.logger.log('Running appointment reminder job...');

        try {
            // Get tomorrow's date range
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            // Find confirmed bookings for tomorrow
            const bookings = await this.prisma.booking.findMany({
                where: {
                    bookingTime: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow,
                    },
                    status: 'CONFIRMED',
                },
                include: {
                    user: true,
                    salon: true,
                    service: true,
                    teamMember: true,
                },
            });

            this.logger.log(`Found ${bookings.length} bookings for tomorrow`);

            for (const booking of bookings) {
                try {
                    const bookingDate = new Date(booking.bookingTime);
                    const dateFormatted = bookingDate.toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                    const timeFormatted = bookingDate.toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });

                    await this.mailService.sendAppointmentReminder(
                        booking.user.email,
                        booking.user.firstName,
                        booking.salon.name,
                        booking.service.title,
                        dateFormatted,
                        timeFormatted,
                        booking.salon.address || undefined,
                        booking.teamMember?.name,
                    );
                } catch (error) {
                    this.logger.error(`Failed to send reminder for booking ${booking.id}:`, error);
                }
            }

            this.logger.log('Appointment reminder job completed');
        } catch (error) {
            this.logger.error('Error in appointment reminder job:', error);
        }
    }
}

import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [EventsModule, NotificationsModule, MailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }

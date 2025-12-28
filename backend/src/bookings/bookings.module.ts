import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MailModule } from 'src/mail/mail.module';
import { CashbackModule } from 'src/cashback/cashback.module';

@Module({
  imports: [EventsModule, NotificationsModule, MailModule, CashbackModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }

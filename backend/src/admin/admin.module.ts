import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EventsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

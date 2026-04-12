import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailModule } from '../mail/mail.module';
import { SalonApplicationsController } from './salon-applications.controller';
import { SalonApplicationsService } from './salon-applications.service';

@Module({
  imports: [PrismaModule, CloudinaryModule, MailModule],
  controllers: [SalonApplicationsController],
  providers: [SalonApplicationsService],
  exports: [SalonApplicationsService],
})
export class SalonApplicationsModule {}

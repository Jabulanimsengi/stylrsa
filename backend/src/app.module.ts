// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SalonsModule } from './salons/salons.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { GalleryModule } from './gallery/gallery.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { LocationsModule } from './locations/locations.module';
import { CategoriesModule } from './categories/categories.module'; // Import the new module
import { ProductOrdersModule } from './product-orders/product-orders.module';
import { SellersModule } from './sellers/sellers.module';
import { MailModule } from './mail/mail.module';
import { CsrfModule } from './common/csrf/csrf.module';
import { TrendsModule } from './trends/trends.module';
import { BlogsModule } from './blogs/blogs.module';
import { SeoModule } from './seo/seo.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { Top10RequestsModule } from './top10-requests/top10-requests.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { UserAddressesModule } from './user-addresses/user-addresses.module';
import { SalonMaterialsModule } from './salon-materials/salon-materials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 10000, // 10000 requests per minute - very generous for production browsing
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 20, // 20 login attempts per 15 minutes
      },
      {
        name: 'uploads',
        ttl: 600000, // 10 minutes
        limit: 100, // 100 uploads per 10 minutes
      },
    ]),
    PrismaModule,
    SalonsModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    AdminModule,
    FavoritesModule,
    LikesModule,
    GalleryModule,
    EventsModule,
    NotificationsModule,
    CloudinaryModule,
    ProductsModule,
    PromotionsModule,
    LocationsModule,
    CategoriesModule, // Add the new module here
    ProductOrdersModule,
    SellersModule,
    MailModule,
    CsrfModule,
    TrendsModule,
    BlogsModule,
    SeoModule,
    TeamMembersModule,
    Top10RequestsModule,
    ScheduleModule.forRoot(),
    TasksModule,
    UserAddressesModule,
    SalonMaterialsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttler disabled - apply @UseGuards(ThrottlerGuard) only on sensitive endpoints
    // This prevents legitimate users from being blocked while browsing
    // Auth endpoints have their own specific throttle limits
  ],
})
export class AppModule { }

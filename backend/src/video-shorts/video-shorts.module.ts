import { Module } from '@nestjs/common';
import { VideoShortsController } from './video-shorts.controller';
import { VideoShortsService } from './video-shorts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VideoShortsController],
    providers: [VideoShortsService],
    exports: [VideoShortsService],
})
export class VideoShortsModule { }

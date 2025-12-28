import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoShortDto } from './dto/create-video-short.dto';
import { UpdateVideoShortDto } from './dto/update-video-short.dto';

@Injectable()
export class VideoShortsService {
    constructor(private prisma: PrismaService) { }

    // Public: Get video shorts displayed on a salon profile
    async findBySalon(salonId: string, limit = 20) {
        return this.prisma.videoShort.findMany({
            where: { salonId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // Public: Increment view count
    async incrementView(id: string) {
        const video = await this.prisma.videoShort.findUnique({ where: { id } });
        if (!video) {
            throw new NotFoundException('Video not found');
        }

        return this.prisma.videoShort.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
    }

    // Owner: Get video shorts for owner's salon
    async findByOwner(userId: string) {
        const salon = await this.prisma.salon.findUnique({
            where: { ownerId: userId },
        });

        if (!salon) {
            throw new NotFoundException('Salon not found for this user');
        }

        return this.prisma.videoShort.findMany({
            where: { salonId: salon.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: string, dto: CreateVideoShortDto) {
        const salon = await this.prisma.salon.findUnique({
            where: { ownerId: userId },
        });

        if (!salon) {
            throw new NotFoundException('Salon not found for this user');
        }

        return this.prisma.videoShort.create({
            data: {
                salonId: salon.id,
                videoUrl: dto.videoUrl,
                thumbnailUrl: dto.thumbnailUrl,
                caption: dto.caption,
            },
        });
    }

    async update(userId: string, id: string, dto: UpdateVideoShortDto) {
        const video = await this.prisma.videoShort.findUnique({
            where: { id },
            include: { salon: true },
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        if (video.salon.ownerId !== userId) {
            throw new ForbiddenException('You are not authorized to update this video');
        }

        return this.prisma.videoShort.update({
            where: { id },
            data: {
                videoUrl: dto.videoUrl ?? video.videoUrl,
                thumbnailUrl: dto.thumbnailUrl ?? video.thumbnailUrl,
                caption: dto.caption ?? video.caption,
            },
        });
    }

    async remove(userId: string, id: string) {
        const video = await this.prisma.videoShort.findUnique({
            where: { id },
            include: { salon: true },
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        if (video.salon.ownerId !== userId) {
            throw new ForbiddenException('You are not authorized to delete this video');
        }

        await this.prisma.videoShort.delete({ where: { id } });
        return { success: true };
    }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonMaterialDto } from './dto/create-salon-material.dto';
import { UpdateSalonMaterialDto } from './dto/update-salon-material.dto';

@Injectable()
export class SalonMaterialsService {
    constructor(private prisma: PrismaService) { }

    // Public: Get materials displayed on a salon profile
    async findBySalon(salonId: string) {
        return this.prisma.salonMaterial.findMany({
            where: { salonId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Owner: Get materials for owner's salon
    async findByOwner(userId: string) {
        const salon = await this.prisma.salon.findUnique({
            where: { ownerId: userId },
        });

        if (!salon) {
            throw new NotFoundException('Salon not found for this user');
        }

        return this.prisma.salonMaterial.findMany({
            where: { salonId: salon.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: string, dto: CreateSalonMaterialDto) {
        const salon = await this.prisma.salon.findUnique({
            where: { ownerId: userId },
        });

        if (!salon) {
            throw new NotFoundException('Salon not found for this user');
        }

        return this.prisma.salonMaterial.create({
            data: {
                salonId: salon.id,
                name: dto.name,
                description: dto.description,
                imageUrl: dto.imageUrl,
                isUsed: dto.isUsed ?? true,
                isSold: dto.isSold ?? false,
                price: dto.price,
            },
        });
    }

    async update(userId: string, id: string, dto: UpdateSalonMaterialDto) {
        const material = await this.prisma.salonMaterial.findUnique({
            where: { id },
            include: { salon: true },
        });

        if (!material) {
            throw new NotFoundException('Material not found');
        }

        if (material.salon.ownerId !== userId) {
            throw new ForbiddenException('You are not authorized to update this material');
        }

        return this.prisma.salonMaterial.update({
            where: { id },
            data: {
                name: dto.name ?? material.name,
                description: dto.description ?? material.description,
                imageUrl: dto.imageUrl ?? material.imageUrl,
                isUsed: dto.isUsed ?? material.isUsed,
                isSold: dto.isSold ?? material.isSold,
                price: dto.price ?? material.price,
            },
        });
    }

    async remove(userId: string, id: string) {
        const material = await this.prisma.salonMaterial.findUnique({
            where: { id },
            include: { salon: true },
        });

        if (!material) {
            throw new NotFoundException('Material not found');
        }

        if (material.salon.ownerId !== userId) {
            throw new ForbiddenException('You are not authorized to delete this material');
        }

        await this.prisma.salonMaterial.delete({ where: { id } });
        return { success: true };
    }
}

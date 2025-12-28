import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Injectable()
export class UserAddressesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.userAddress.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(userId: string, id: string) {
        const address = await this.prisma.userAddress.findUnique({
            where: { id },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        if (address.userId !== userId) {
            throw new ForbiddenException('You are not authorized to view this address');
        }

        return address;
    }

    async create(userId: string, dto: CreateUserAddressDto) {
        // If this is the first address or marked as default, set it as default
        const existingAddresses = await this.prisma.userAddress.count({
            where: { userId },
        });

        const isDefault = existingAddresses === 0 || dto.isDefault === true;

        // If setting as default, unset other defaults
        if (isDefault) {
            await this.prisma.userAddress.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return this.prisma.userAddress.create({
            data: {
                userId,
                label: dto.label || 'HOME',
                address: dto.address,
                latitude: dto.latitude,
                longitude: dto.longitude,
                isDefault,
            },
        });
    }

    async update(userId: string, id: string, dto: UpdateUserAddressDto) {
        const address = await this.findOne(userId, id);

        // If setting as default, unset other defaults
        if (dto.isDefault === true) {
            await this.prisma.userAddress.updateMany({
                where: { userId, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.userAddress.update({
            where: { id },
            data: {
                label: dto.label ?? address.label,
                address: dto.address ?? address.address,
                latitude: dto.latitude ?? address.latitude,
                longitude: dto.longitude ?? address.longitude,
                isDefault: dto.isDefault ?? address.isDefault,
            },
        });
    }

    async setDefault(userId: string, id: string) {
        await this.findOne(userId, id); // Validates ownership

        // Unset all other defaults
        await this.prisma.userAddress.updateMany({
            where: { userId },
            data: { isDefault: false },
        });

        // Set this one as default
        return this.prisma.userAddress.update({
            where: { id },
            data: { isDefault: true },
        });
    }

    async remove(userId: string, id: string) {
        const address = await this.findOne(userId, id);

        await this.prisma.userAddress.delete({ where: { id } });

        // If we deleted the default, make the most recent one default
        if (address.isDefault) {
            const remaining = await this.prisma.userAddress.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            if (remaining) {
                await this.prisma.userAddress.update({
                    where: { id: remaining.id },
                    data: { isDefault: true },
                });
            }
        }

        return { success: true };
    }

    async getDefaultAddress(userId: string) {
        return this.prisma.userAddress.findFirst({
            where: { userId, isDefault: true },
        });
    }
}

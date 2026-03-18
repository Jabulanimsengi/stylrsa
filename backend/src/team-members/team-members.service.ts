import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private prisma: PrismaService) {}

  private serializeTeamMember(teamMember: any) {
    const assignments = Array.isArray(teamMember.services) ? teamMember.services : [];
    return {
      ...teamMember,
      serviceIds: assignments.map((item: any) => item.serviceId),
      services: assignments
        .map((item: any) => item.service)
        .filter(Boolean),
    };
  }

  private buildServiceAssignments(serviceIds?: string[]) {
    const normalizedServiceIds = Array.from(
      new Set((serviceIds ?? []).filter((serviceId) => typeof serviceId === 'string' && serviceId.trim().length > 0)),
    );

    return {
      normalizedServiceIds,
      assignmentRows: normalizedServiceIds.map((serviceId) => ({ serviceId })),
    };
  }

  async create(user: any, salonId: string, dto: CreateTeamMemberDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (user.role !== 'ADMIN' && salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to add team members to this salon.');
    }

    const { normalizedServiceIds, assignmentRows } = this.buildServiceAssignments(
      dto.serviceIds,
    );

    if (normalizedServiceIds.length > 0) {
      const matchingServices = await this.prisma.service.findMany({
        where: {
          id: { in: normalizedServiceIds },
          salonId,
        },
        select: { id: true },
      });

      if (matchingServices.length !== normalizedServiceIds.length) {
        throw new ForbiddenException(
          'One or more selected services do not belong to this salon.',
        );
      }
    }

    const createdTeamMember = await this.prisma.teamMember.create({
      data: {
        salonId,
        name: dto.name,
        role: dto.role,
        bio: dto.bio,
        image: dto.image,
        galleryImages: dto.galleryImages || [],
        specialties: dto.specialties || [],
        experience: dto.experience,
        sortOrder: dto.sortOrder || 0,
        services: assignmentRows.length
          ? {
              create: assignmentRows,
            }
          : undefined,
      },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                salonId: true,
              },
            },
          },
        },
      },
    });

    return this.serializeTeamMember(createdTeamMember);
  }

  async findBySalon(salonId: string, includeInactive = false) {
    const where: any = { salonId };
    if (!includeInactive) {
      where.isActive = true;
    }
    const members = await this.prisma.teamMember.findMany({
      where,
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                salonId: true,
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return members.map((member) => this.serializeTeamMember(member));
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                salonId: true,
              },
            },
          },
        },
      },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    return this.serializeTeamMember(member);
  }

  async update(user: any, id: string, dto: UpdateTeamMemberDto) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    if (user.role !== 'ADMIN' && member.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to update this team member.');
    }

    const { normalizedServiceIds, assignmentRows } = this.buildServiceAssignments(
      dto.serviceIds,
    );

    if (normalizedServiceIds.length > 0) {
      const matchingServices = await this.prisma.service.findMany({
        where: {
          id: { in: normalizedServiceIds },
          salonId: member.salonId,
        },
        select: { id: true },
      });

      if (matchingServices.length !== normalizedServiceIds.length) {
        throw new ForbiddenException(
          'One or more selected services do not belong to this salon.',
        );
      }
    }

    const { serviceIds: _ignoredServiceIds, ...teamMemberFields } = dto;

    const updatedTeamMember = await this.prisma.teamMember.update({
      where: { id },
      data: {
        ...teamMemberFields,
        services:
          dto.serviceIds !== undefined
            ? {
                deleteMany: {},
                create: assignmentRows,
              }
            : undefined,
      },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                salonId: true,
              },
            },
          },
        },
      },
    });

    return this.serializeTeamMember(updatedTeamMember);
  }

  async remove(user: any, id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    if (user.role !== 'ADMIN' && member.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this team member.');
    }

    await this.prisma.teamMember.delete({ where: { id } });
    return { message: 'Team member deleted successfully.' };
  }
}

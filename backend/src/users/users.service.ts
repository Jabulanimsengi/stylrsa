import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SelectUserRoleDto } from './dto/select-user-role.dto';

type OnboardingStatus =
  | 'ROLE_REQUIRED'
  | 'PROVIDER_SETUP_REQUIRED'
  | 'COMPLETE';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private sanitizeUser<T extends { password?: string }>(user: T) {
    const { password: _password, ...result } = user;
    return result;
  }

  private getOnboardingStatusForRole(
    role: 'SALON_OWNER',
  ): OnboardingStatus {
    return role === 'SALON_OWNER'
      ? 'PROVIDER_SETUP_REQUIRED'
      : 'COMPLETE';
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        onboardingStatus: true,
        emailVerified: true,
        createdAt: true,
        profileImage: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
    return this.sanitizeUser(user as any);
  }

  async selectRole(userId: string, dto: SelectUserRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('This account role cannot be changed.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: dto.role,
        onboardingStatus: this.getOnboardingStatusForRole(dto.role),
      },
    });

    return this.sanitizeUser(updated as any);
  }
}

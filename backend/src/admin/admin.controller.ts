import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
  Delete,
  Req,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePlanPaymentStatusDto } from './dto/update-plan-payment-status.dto';
import { DeleteEntityDto } from './dto/delete-entity.dto';
import { Request } from 'express';
import { UpdateSalonApplicationStatusDto } from '../salon-applications/dto/update-salon-application-status.dto';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('salons/all')
  getAllSalons() {
    return this.adminService.getAllSalons();
  }

  @Get('services/pending')
  getPendingServices() {
    return this.adminService.getPendingServices();
  }

  @Get('salons/pending')
  getPendingSalons() {
    return this.adminService.getPendingSalons();
  }

  @Get('salon-applications')
  getSalonApplications() {
    return this.adminService.getSalonApplications();
  }

  @Get('bookings')
  getBookings() {
    return this.adminService.getBookingsOverview();
  }

  @Get('bookings/export')
  async exportBookings(@Req() req: Request) {
    const csv = await this.adminService.exportBookingsCsv();

    (req as any).res?.setHeader('Content-Type', 'text/csv; charset=utf-8');
    (req as any).res?.setHeader(
      'Content-Disposition',
      'attachment; filename="stylrsa-bookings.csv"',
    );

    return csv;
  }

  @Patch('services/:serviceId/status')
  updateServiceStatus(
    @Param('serviceId') serviceId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateServiceStatus(
      serviceId,
      approvalStatus as any,
      adminId,
    );
  }

  @Patch('salons/:salonId/status')
  updateSalonStatus(
    @Param('salonId') salonId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateSalonStatus(
      salonId,
      approvalStatus as any,
      adminId,
    );
  }

  @Patch('salon-applications/:applicationId/status')
  updateSalonApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateSalonApplicationStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateSalonApplicationStatus(
      applicationId,
      dto.status,
      adminId,
      dto.adminNotes,
    );
  }

  @Post('salon-applications/:applicationId/publish')
  publishSalonApplication(
    @Param('applicationId') applicationId: string,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.publishSalonApplication(applicationId, adminId);
  }

  @Patch('salons/:salonId/verification')
  toggleSalonVerification(
    @Param('salonId') salonId: string,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.toggleSalonVerification(salonId, adminId);
  }

  @Get('salons/deleted')
  getDeletedSalons() {
    return this.adminService.getDeletedSalons();
  }

  @Patch('salons/:salonId/plan')
  updateSalonPlan(
    @Param('salonId') salonId: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.adminService.setSalonPlan(salonId, dto.planCode ?? '', {
      visibilityWeight: dto.visibilityWeight,
      maxListings: dto.maxListings,
    });
  }

  @Delete('salons/:salonId')
  deleteSalon(
    @Param('salonId') salonId: string,
    @Body() dto: DeleteEntityDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.deleteSalonWithCascade(
      salonId,
      adminId ?? 'unknown',
      dto?.reason,
    );
  }

  @Patch('salons/:salonId/plan/payment')
  updateSalonPlanPaymentStatus(
    @Param('salonId') salonId: string,
    @Body() dto: UpdatePlanPaymentStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateSalonPlanPaymentStatus({
      salonId,
      status: dto.status,
      adminId,
      paymentReference: dto.paymentReference ?? null,
    });
  }

  @Post('salons/deleted/:archiveId/restore')
  restoreSalon(@Param('archiveId') archiveId: string) {
    return this.adminService.restoreDeletedSalon(archiveId);
  }

  @Get('audit')
  getAudit() {
    return (this.adminService as any).prisma?.adminActionLog
      ? (this.adminService as any).prisma.adminActionLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      : (this.adminService as any).prisma.$queryRawUnsafe(
        'SELECT id, "adminId", action, "targetType", "targetId", reason, metadata, "createdAt" FROM "AdminActionLog" ORDER BY "createdAt" DESC LIMIT 200',
      );
  }

  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }
}

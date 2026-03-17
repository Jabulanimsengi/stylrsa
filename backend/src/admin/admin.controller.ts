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

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  @Get('salons/all')
  getAllSalons() {
    return this.adminService.getAllSalons();
  }

  @Get('services/pending')
  getPendingServices() {
    return this.adminService.getPendingServices();
  }

  @Get('salons/pending')
  getPendingSalons(@Req() req: Request) {
    const adminId = (req as any)?.user?.id;
    const adminRole = (req as any)?.user?.role;
    console.log('[AdminController] getPendingSalons called by:', { adminId, adminRole });
    return this.adminService.getPendingSalons();
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

  @Patch('salons/:salonId/verification')
  toggleSalonVerification(
    @Param('salonId') salonId: string,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.toggleSalonVerification(salonId, adminId);
  }

  @Get('reviews/pending')
  getPendingReviews() {
    return this.adminService.getPendingReviews();
  }

  @Get('salons/deleted')
  getDeletedSalons() {
    return this.adminService.getDeletedSalons();
  }

  @Patch('reviews/:reviewId/status')
  updateReviewStatus(
    @Param('reviewId') reviewId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateReviewStatus(
      reviewId,
      approvalStatus as any,
      adminId,
    );
  }

  @Get('products/pending')
  getPendingProducts() {
    return this.adminService.getPendingProducts();
  }

  @Patch('products/:productId/status')
  updateProductStatus(
    @Param('productId') productId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateProductStatus(
      productId,
      approvalStatus as any,
      adminId,
    );
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

  @Patch('sellers/:sellerId/plan')
  updateSellerPlan(
    @Param('sellerId') sellerId: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.adminService.setSellerPlan(sellerId, dto.planCode ?? '', {
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

  @Patch('sellers/:sellerId/plan/payment')
  updateSellerPlanPaymentStatus(
    @Param('sellerId') sellerId: string,
    @Body() dto: UpdatePlanPaymentStatusDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.updateSellerPlanPaymentStatus({
      sellerId,
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
    // Simple list; can be extended with query filters later
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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

  @Get('sellers/all')
  getAllSellers() {
    return this.adminService.getAllSellers();
  }

  @Get('sellers/deleted')
  getDeletedSellers() {
    return this.adminService.getDeletedSellersArchive();
  }

  @Delete('sellers/:sellerId')
  deleteSeller(
    @Param('sellerId') sellerId: string,
    @Body() dto: DeleteEntityDto,
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string | undefined;
    return this.adminService.deleteSellerWithCascade(
      sellerId,
      adminId ?? 'unknown',
      dto?.reason,
    );
  }

  @Post('sellers/deleted/:archiveId/restore')
  restoreSeller(@Param('archiveId') archiveId: string) {
    return this.adminService.restoreDeletedSeller(archiveId);
  }

  @Patch('sellers/:sellerId/approval')
  updateSellerApprovalStatus(
    @Param('sellerId') sellerId: string,
    @Body() body: { status: 'PENDING' | 'APPROVED' | 'REJECTED' },
    @Req() req: Request,
  ) {
    const adminId = (req as any)?.user?.id as string ?? 'unknown';
    return this.adminService.updateSellerApprovalStatus(sellerId, body.status, adminId);
  }

  @Get('diagnostic/deleted-sellers-table')
  async checkDeletedSellersTable() {
    return this.adminService.diagnosticDeletedSellersTable();
  }

}

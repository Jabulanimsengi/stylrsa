import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonApplicationDto } from './dto/create-salon-application.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SalonApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
  ) {}

  private async generateApplicationReference(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reference = `SAL-${Date.now().toString().slice(-6)}${Math.floor(
        100 + Math.random() * 900,
      )}`;

      const existing = await this.prisma.salonApplication.findUnique({
        where: { applicationReference: reference },
        select: { id: true },
      });

      if (!existing) {
        return reference;
      }
    }

    throw new BadRequestException(
      'Unable to generate a unique application reference. Please try again.',
    );
  }

  async create(dto: CreateSalonApplicationDto) {
    const duplicate = await this.prisma.salonApplication.findFirst({
      where: {
        OR: [
          { salonName: dto.salonName.trim() },
          { phoneNumber: dto.phoneNumber.trim() },
          dto.whatsappNumber
            ? { whatsappNumber: dto.whatsappNumber.trim() }
            : undefined,
        ].filter(Boolean) as any[],
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'],
        },
      },
      select: { id: true, salonName: true },
    });

    if (duplicate) {
      throw new BadRequestException(
        'A salon submission with the same name or number is already under review.',
      );
    }

    const operatingHours = Array.isArray(dto.operatingHours)
      ? dto.operatingHours.map((entry) => ({
          day: entry.day,
          open: entry.open,
          close: entry.close,
        }))
      : [];

    const operatingDays =
      dto.operatingDays && dto.operatingDays.length > 0
        ? dto.operatingDays
        : operatingHours.map((entry) => entry.day);

    const applicationReference = await this.generateApplicationReference();

    const application = await this.prisma.salonApplication.create({
      data: {
        applicationReference,
        salonName: dto.salonName.trim(),
        contactPersonName: dto.contactPersonName.trim(),
        email: dto.email.trim().toLowerCase(),
        phoneNumber: dto.phoneNumber.trim(),
        whatsappNumber: dto.whatsappNumber?.trim() || null,
        description: dto.description?.trim() || null,
        address: dto.address.trim(),
        postalCode: dto.postalCode?.trim() || null,
        town: dto.town.trim(),
        city: dto.city.trim(),
        province: dto.province.trim(),
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        website: dto.website?.trim() || null,
        facebookUrl: dto.facebookUrl?.trim() || null,
        instagramUrl: dto.instagramUrl?.trim() || null,
        tiktokUrl: dto.tiktokUrl?.trim() || null,
        googleReviewsUrl: dto.googleReviewsUrl?.trim() || null,
        freshaReviewsUrl: dto.freshaReviewsUrl?.trim() || null,
        booksyReviewsUrl: dto.booksyReviewsUrl?.trim() || null,
        bookingType: (dto.bookingType as any) ?? 'ONSITE',
        offersMobile:
          typeof dto.offersMobile === 'boolean'
            ? dto.offersMobile
            : (dto.bookingType ?? 'ONSITE') !== 'ONSITE',
        mobileFee: dto.mobileFee ?? null,
        operatingHours,
        operatingDays,
        bankName: dto.bankName.trim(),
        accountHolder: dto.accountHolder.trim(),
        accountNumber: dto.accountNumber.trim(),
        branchCode: dto.branchCode?.trim() || null,
        priceListFileUrl: dto.priceListFileUrl.trim(),
        bankingProofFileUrl: dto.bankingProofFileUrl.trim(),
        portfolioImageUrls: dto.portfolioImageUrls ?? [],
      },
    });

    const location = [dto.city.trim(), dto.province.trim()]
      .filter(Boolean)
      .join(', ');

    void this.mailService.notifyAdminNewSalonApplication(
      application.applicationReference,
      application.salonName,
      application.contactPersonName,
      application.email,
      location,
    );

    void this.mailService.sendSalonApplicationReceived(
      application.email,
      application.contactPersonName,
      application.salonName,
      application.applicationReference,
    );

    return application;
  }

  async uploadDocument(
    file: Express.Multer.File,
    kind: 'price-list' | 'banking-proof' | 'portfolio',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const folderByKind: Record<typeof kind, string> = {
      'price-list': 'salon-applications/price-lists',
      'banking-proof': 'salon-applications/banking-proofs',
      portfolio: 'salon-applications/portfolio',
    };

    const result = await this.cloudinaryService.uploadFile(
      file,
      folderByKind[kind],
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      resourceType: result.resource_type,
    };
  }

  async findOneOrThrow(id: string) {
    const application = await this.prisma.salonApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Salon application not found.');
    }

    return application;
  }
}

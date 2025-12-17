import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTop10RequestDto } from './dto/create-top10-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import sgMail from '@sendgrid/mail';

@Injectable()
export class Top10RequestsService {
  private readonly logger = new Logger(Top10RequestsService.name);
  private isEmailConfigured: boolean = false;
  private fromEmail: string;
  private adminEmail: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isEmailConfigured = true;
      this.logger.log('[URGENT REQUEST] SendGrid configured successfully');
    } else {
      this.logger.warn('[URGENT REQUEST] SENDGRID_API_KEY not configured. Email notifications disabled.');
    }
    this.fromEmail = this.config.get<string>('FROM_EMAIL') || 'noreply@stylrsa.co.za';
    this.adminEmail = this.config.get<string>('ADMIN_EMAIL') || 'jbmsengi@gmail.com';
  }

  async createRequest(dto: CreateTop10RequestDto) {
    this.logger.log(`🚨 New Urgent Request received for category: ${dto.category}`);

    // Store the request in database
    const request = await this.prisma.top10Request.create({
      data: {
        userId: dto.userId,
        fullName: dto.fullName,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        category: dto.category,
        serviceNeeded: dto.serviceNeeded,
        styleOrLook: dto.styleOrLook,
        budget: dto.budget,
        serviceType: dto.serviceType,
        location: dto.location,
        latitude: dto.locationCoords?.lat,
        longitude: dto.locationCoords?.lng,
        preferredDate: new Date(dto.preferredDate),
        preferredTime: dto.preferredTime,
        images: dto.images || [],
        status: 'PENDING',
      },
    });

    // Send email notification to admin
    try {
      await this.sendAdminNotification(dto, request.id);
    } catch (error) {
      this.logger.error('Failed to send admin notification email', error);
    }

    // Send in-app notification to all admins
    try {
      await this.notifyAdmins(dto);
    } catch (error) {
      this.logger.error('Failed to send admin in-app notifications', error);
    }

    return request;
  }

  private async notifyAdmins(dto: CreateTop10RequestDto) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const message = `🚨 URGENT REQUEST: ${dto.category} from ${dto.fullName}`;
    const link = '/admin?tab=urgent-requests';

    await Promise.all(
      admins.map((admin) =>
        this.notificationsService.create(admin.id, message, { link }),
      ),
    );
  }

  private async sendAdminNotification(dto: CreateTop10RequestDto, requestId: string) {
    if (!this.isEmailConfigured) {
      this.logger.log(`[DEV] Urgent request notification for admin: ${dto.category} - ${dto.fullName}`);
      return;
    }

    const subject = `🚨 URGENT REQUEST: ${dto.category} - ${dto.fullName}`;
    const imagesCount = dto.images?.length || 0;

    // Create image thumbnails HTML if images exist
    const imagesHtml = imagesCount > 0 ? `
      <h4>📷 Attached Photos (${imagesCount})</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
        ${dto.images!.map((img, i) => `
          <a href="${img}" target="_blank" style="display: inline-block;">
            <img src="${img}" alt="Photo ${i + 1}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #F51957;" />
          </a>
        `).join('')}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F51957 0%, #d4144c 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
            h2 { margin: 0; }
            h3 { color: #F51957; margin-top: 0; }
            h4 { color: #333; margin-bottom: 10px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .badge { display: inline-block; background: #F51957; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .cta { display: inline-block; margin-top: 20px; padding: 12px 28px; background: #F51957; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 URGENT REQUEST</h2>
              <p style="margin: 10px 0 0; opacity: 0.9;">Immediate attention required</p>
            </div>
            <div class="content">
              <h3>📋 Category: ${dto.category}</h3>
              
              <h4>Contact Details</h4>
              <ul>
                <li><strong>Name:</strong> ${dto.fullName}</li>
                <li><strong>Phone:</strong> <a href="tel:${dto.phone}">${dto.phone}</a></li>
                ${dto.whatsapp ? `<li><strong>WhatsApp:</strong> <a href="https://wa.me/${dto.whatsapp.replace(/[^0-9]/g, '')}">${dto.whatsapp}</a></li>` : ''}
                ${dto.email ? `<li><strong>Email:</strong> <a href="mailto:${dto.email}">${dto.email}</a></li>` : ''}
              </ul>
              
              <h4>Service Details</h4>
              <ul>
                <li><strong>Service Needed:</strong> ${dto.serviceNeeded}</li>
                ${dto.styleOrLook ? `<li><strong>Style/Look:</strong> ${dto.styleOrLook}</li>` : ''}
                <li><strong>Budget:</strong> R${dto.budget}</li>
                <li><strong>Service Type:</strong> <span class="badge">${dto.serviceType === 'onsite' ? 'Mobile (come to client)' : 'Visit Salon'}</span></li>
              </ul>
              
              <h4>Location & Time</h4>
              <ul>
                <li><strong>Location:</strong> ${dto.location}</li>
                <li><strong>Preferred Date:</strong> ${dto.preferredDate}</li>
                ${dto.preferredTime ? `<li><strong>Preferred Time:</strong> ${dto.preferredTime}</li>` : ''}
              </ul>
              
              ${imagesHtml}
              
              <a href="https://stylrsa.co.za/admin?tab=urgent-requests" class="cta">View in Admin Panel</a>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <em>Please match this client with top providers in their area ASAP.</em>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sgMail.send({
        from: this.fromEmail,
        to: this.adminEmail,
        subject,
        html,
      });
      this.logger.log(`[EMAIL] Urgent request notification sent to admin: ${this.adminEmail}`);
    } catch (error) {
      this.logger.error('Failed to send admin email:', error);
      throw error;
    }
  }

  async getAllRequests(status?: string) {
    return this.prisma.top10Request.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string) {
    return this.prisma.top10Request.update({
      where: { id },
      data: { status },
    });
  }
}


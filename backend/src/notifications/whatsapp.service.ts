import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly accessToken?: string;
  private readonly phoneNumberId?: string;
  private readonly apiVersion: string;

  constructor(private readonly config: ConfigService) {
    this.accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.apiVersion = this.config.get<string>('WHATSAPP_API_VERSION') || 'v22.0';
  }

  private normalizePhoneNumber(phoneNumber?: string | null): string | null {
    if (!phoneNumber) return null;

    const digits = phoneNumber.replace(/\D+/g, '');
    if (!digits) return null;
    if (digits.startsWith('27')) return digits;
    if (digits.startsWith('0') && digits.length === 10) {
      return `27${digits.slice(1)}`;
    }

    return digits;
  }

  private get isConfigured() {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  async sendSalonApprovalMessage(params: {
    phoneNumber?: string | null;
    ownerName?: string | null;
    salonName: string;
  }) {
    const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber);
    if (!normalizedPhone) {
      return false;
    }

    const ownerName = params.ownerName?.trim() || 'there';
    const messageBody = `Hi ${ownerName}, your salon profile "${params.salonName}" has been approved on Stylr SA. You can now log in to your dashboard and start managing your listing.`;

    if (!this.isConfigured) {
      console.log(`[WHATSAPP][DEV] Approval message for ${normalizedPhone}: ${messageBody}`);
      return false;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: normalizedPhone,
            type: 'text',
            text: {
              body: messageBody,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown WhatsApp API error');
        console.error('[WHATSAPP] Failed to send approval message:', errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[WHATSAPP] Failed to send approval message:', error);
      return false;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resendMailAdapter } from './resend-adapter';

@Injectable()
export class MailService {
  private isConfigured: boolean = false;
  private fromEmail: string;
  private adminEmail: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      console.warn('[MAIL] RESEND_API_KEY not configured. Email sending will be disabled.');
      this.isConfigured = false;
    } else {
      resendMailAdapter.setApiKey(apiKey);
      this.isConfigured = true;
    }
    this.fromEmail = this.config.get<string>('FROM_EMAIL') || 'noreply@stylrsa.co.za';
    this.adminEmail = this.config.get<string>('ADMIN_EMAIL') || 'jbmsengi@gmail.com';
  }

  private async sendEmail(message: {
    to: string | string[];
    from: string;
    subject: string;
    html: string;
  }) {
    await resendMailAdapter.send(message);
  }

  async sendVerificationEmail(email: string, code: string, firstName: string) {
    if (!this.isConfigured) {
      console.warn('[MAIL] Verification email skipped because email delivery is not configured.');
      return;
    }

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Verify your email - Stylr SA',
        html: this.getVerificationEmailTemplate(firstName, code),
      };
      await this.sendEmail(msg);
    } catch (error) {
      console.error('[EMAIL] Failed to send verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    if (!this.isConfigured) {
      console.log(`[DEV] Welcome email for ${email}`);
      return;
    }

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Welcome to Stylr SA!',
        html: this.getWelcomeEmailTemplate(firstName),
      };
      await this.sendEmail(msg);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string) {
    if (!this.isConfigured) {
      console.warn('[MAIL] Password reset email skipped because email delivery is not configured.');
      return;
    }

    const resetUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3001'}/reset-password?token=${token}`;

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Reset your password - Stylr SA',
        html: this.getEnhancedPasswordResetTemplate(firstName, resetUrl),
      };
      await this.sendEmail(msg);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendAccountLockedEmail(email: string, firstName: string, unlockTime: Date) {
    if (!this.isConfigured) {
      console.log(`[DEV] Account locked email for ${email}`);
      return;
    }

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Account Temporarily Locked - Stylr SA',
        html: this.getAccountLockedTemplate(firstName, unlockTime),
      };
      await this.sendEmail(msg);
    } catch (error) {
      console.error('Failed to send account locked email:', error);
    }
  }

  async send2FASetupEmail(email: string, firstName: string) {
    if (!this.isConfigured) {
      console.log(`[DEV] 2FA setup email for ${email}`);
      return;
    }

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Two-Factor Authentication Enabled - Stylr SA',
        html: this.get2FASetupTemplate(firstName),
      };
      await this.sendEmail(msg);
    } catch (error) {
      console.error('Failed to send 2FA setup email:', error);
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #18181b; margin: 0; padding: 24px 16px; background: #f3f4f6; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 24px 60px rgba(15,23,42,0.08); overflow: hidden; border: 1px solid rgba(148,163,184,0.16); }
            .content { padding: 32px; }
            .logo { font-size: 28px; font-weight: 800; color: #111827; margin: 18px 0 10px; letter-spacing: -0.03em; }
            .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 12px; }
            .text { font-size: 15px; color: #4b5563; margin-bottom: 18px; }
            .code-box { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #111827; background: linear-gradient(180deg, #f9fafb 0%, #eef2f7 100%); padding: 24px; border-radius: 20px; margin: 28px 0 20px; font-family: 'Courier New', monospace; border: 1px solid #d7dde6; }
            .divider { display: none; }
            .footer { text-align: center; font-size: 13px; color: #6b7280; padding: 20px 32px 32px; }
            .small { font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="padding: 32px; background: linear-gradient(135deg, #111827 0%, #1f2937 52%, #374151 100%); color: #ffffff;">
              <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.12); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Account Security</span>
              <div class="logo" style="color: #ffffff;">Stylr SA</div>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.82);">Confirm your email address to finish setting up your account and continue into the platform.</p>
            </div>
            <div class="content">
              <p class="greeting">Hi ${firstName},</p>
              <p class="text">Use the verification code below to confirm your email and finish signing in securely.</p>
              <p style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">Your verification code</p>
              <div class="code-box">${verificationCode}</div>
              <div style="display: grid; gap: 12px; margin-top: 20px;">
                <div style="padding: 14px 16px; border-radius: 16px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;"><strong style="color: #111827;">Expires in:</strong> 15 minutes</div>
                <div style="padding: 14px 16px; border-radius: 16px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;"><strong style="color: #111827;">Heads up:</strong> If you did not request this code, you can safely ignore this email.</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Stylr SA</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F51957 0%, #d4144c 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content h3 { color: #F51957; font-size: 18px; margin-top: 24px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .content ul { color: #4D4952; font-size: 16px; line-height: 1.9; padding-left: 20px; }
            .content li { margin-bottom: 8px; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your email has been verified successfully! You now have full access to Stylr SA.</p>
              <p>Start exploring amazing salon services, book appointments, and connect with top beauty professionals in South Africa.</p>
              <h3>✨ What's Next?</h3>
              <ul>
                <li>🔍 Browse salons and services in your area</li>
                <li>📅 Book your first appointment</li>
                <li>⭐ Leave reviews and share your experiences</li>
                <li>❤️ Save your favorite salons</li>
              </ul>
              <p style="margin-top: 24px;">If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .content { padding: 40px 32px; }
            .logo { font-size: 24px; font-weight: 700; color: #F51957; text-align: center; margin-bottom: 32px; }
            .greeting { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
            .text { font-size: 15px; color: #555; margin-bottom: 24px; }
            .button { display: block; width: fit-content; margin: 0 auto 24px; padding: 14px 40px; background: #F51957; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center; }
            .divider { height: 1px; background: #eee; margin: 24px 0; }
            .footer { text-align: center; font-size: 13px; color: #888; padding: 0 32px 32px; }
            .small { font-size: 13px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo">Stylr SA</div>
              <p class="greeting">Hi ${firstName},</p>
              <p class="text">We received a request to reset your password. Click the button below to create a new one:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p class="small">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="divider"></div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Stylr SA</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getEnhancedPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #18181b; margin: 0; padding: 24px 16px; background: #f3f4f6; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 24px 60px rgba(15,23,42,0.08); overflow: hidden; border: 1px solid rgba(148,163,184,0.16); }
            .hero { padding: 32px; background: linear-gradient(135deg, #111827 0%, #1f2937 52%, #374151 100%); color: #ffffff; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.12); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; margin: 18px 0 10px; letter-spacing: -0.03em; }
            .heroCopy { margin: 0; font-size: 15px; color: rgba(255,255,255,0.82); }
            .content { padding: 32px; }
            .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 12px; }
            .text { font-size: 15px; color: #4b5563; margin-bottom: 18px; }
            .button { display: inline-block; margin: 8px 0 18px; padding: 14px 28px; background: #111827; color: #ffffff !important; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 15px; text-align: center; }
            .infoCard { padding: 14px 16px; border-radius: 16px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563; margin-top: 16px; }
            .linkBox { margin-top: 18px; padding: 16px; border-radius: 16px; background: #f9fafb; border: 1px dashed #d1d5db; }
            .linkLabel { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; }
            .linkValue { margin: 0; font-size: 13px; color: #111827; word-break: break-all; }
            .footer { text-align: center; font-size: 13px; color: #6b7280; padding: 0 32px 32px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="hero">
              <span class="badge">Password reset</span>
              <div class="logo">Stylr SA</div>
              <p class="heroCopy">Use the secure link below to choose a new password and get back into your account.</p>
            </div>
            <div class="content">
              <p class="greeting">Hi ${firstName},</p>
              <p class="text">We received a request to reset your password. Tap the button below to create a new one.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="infoCard"><strong style="color: #111827;">Expires in:</strong> 1 hour</div>
              <div class="infoCard"><strong style="color: #111827;">Didn&apos;t request this?</strong> You can safely ignore this email and your current password will stay the same.</div>
              <div class="linkBox">
                <p class="linkLabel">Having trouble with the button?</p>
                <p class="linkValue">${resetUrl}</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Stylr SA</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getAccountLockedTemplate(firstName: string, unlockTime: Date): string {
    const unlockTimeStr = unlockTime.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffc107 0%, #f9a825 100%); color: #1c1c1e; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .unlock-time { background: #fff4d6; border-left: 4px solid #f9a825; padding: 16px; border-radius: 6px; margin: 20px 0; font-weight: 600; color: #b7791f; }
            .security-info { background: #ffd1dd; border-left: 4px solid #F51957; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Temporarily Locked</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
              <div class="unlock-time">
                🕒 Your account will be automatically unlocked at:<br>
                ${unlockTimeStr}
              </div>
              <p>This is a security measure to protect your account from unauthorized access.</p>
              <p>Once your account is unlocked, you can:</p>
              <ul style="color: #4D4952; font-size: 16px; line-height: 1.8;">
                <li>Log in with your correct password</li>
                <li>Use the "Forgot Password" option to reset your password</li>
              </ul>
              <div class="security-info">
                <p style="margin: 0; font-weight: 600; color: #F51957;">🚨 Didn't attempt to log in?</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">If you didn't try to access your account, please contact our support team immediately. This could indicate unauthorized access attempts.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private get2FASetupTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #43414A; margin: 0; padding: 0; background-color: #f9f6f1; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3ab7a5 0%, #2e9687 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .content h2 { color: #43414A; margin-top: 0; font-size: 22px; }
            .content p { color: #4D4952; font-size: 16px; line-height: 1.7; }
            .success-box { background: #cdecea; border-left: 4px solid #3ab7a5; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .warning-box { background: #fff4d6; border-left: 4px solid #f9a825; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .security-info { background: #ffd1dd; border-left: 4px solid #F51957; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #4D4952; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Two-Factor Authentication Enabled</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <div class="success-box">
                <p style="margin: 0; font-weight: 600; color: #25776c;">✅ 2FA Successfully Enabled</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #25776c;">Your account security has been enhanced!</p>
              </div>
              <p>Two-factor authentication (2FA) has been successfully enabled on your account. Your account is now more secure!</p>
              <p><strong>How it works:</strong></p>
              <ul style="color: #4D4952; font-size: 16px; line-height: 1.8;">
                <li>Each time you log in, you'll need to enter your password</li>
                <li>Then enter a 6-digit verification code from your authenticator app</li>
                <li>This adds an extra layer of protection to your account</li>
              </ul>
              <div class="warning-box">
                <p style="margin: 0; font-weight: 600; color: #b7791f;">⚠️ Important: Save Your Backup Codes</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">Keep your backup codes safe! You'll need them if you lose access to your authenticator app. Store them in a secure location.</p>
              </div>
              <div class="security-info">
                <p style="margin: 0; font-weight: 600; color: #F51957;">🚨 Didn't enable 2FA?</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4D4952;">If you didn't enable two-factor authentication, please contact our support team immediately and change your password.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stylr SA. All rights reserved.</p>
              <p>Your one-stop platform for discovering and booking salon services.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // ===== ADMIN NOTIFICATION METHODS =====

  async notifyAdminNewVideo(salonName: string, videoTitle: string, uploadedBy: string) {
    await this.sendAdminNotification(
      '🎬 New Video Uploaded - Needs Review',
      `A new video has been uploaded and requires your review.`,
      [
        { label: 'Salon', value: salonName },
        { label: 'Video Title', value: videoTitle || 'Untitled' },
        { label: 'Uploaded By', value: uploadedBy },
      ],
      'Video'
    );
  }

  async notifyAdminNewService(salonName: string, serviceName: string, price: string, createdBy: string) {
    await this.sendAdminNotification(
      '💇 New Service Added - Needs Review',
      `A new service has been added and requires your review.`,
      [
        { label: 'Salon', value: salonName },
        { label: 'Service', value: serviceName },
        { label: 'Price', value: price },
        { label: 'Created By', value: createdBy },
      ],
      'Service'
    );
  }

  async notifyAdminNewSalon(salonName: string, ownerName: string, ownerEmail: string, location: string) {
    await this.sendAdminNotification(
      '🏪 New Salon Registered - Needs Review',
      `A new salon has been registered and requires your approval.`,
      [
        { label: 'Salon Name', value: salonName },
        { label: 'Owner', value: ownerName },
        { label: 'Email', value: ownerEmail },
        { label: 'Location', value: location },
      ],
      'Salon'
    );
  }

  async notifyAdminNewSalonApplication(
    applicationReference: string,
    salonName: string,
    ownerName: string,
    ownerEmail: string,
    location: string,
  ) {
    await this.sendAdminNotification(
      'New Salon Application Submitted',
      `A new salon application has been submitted and is awaiting admin review.`,
      [
        { label: 'Reference', value: applicationReference },
        { label: 'Salon Name', value: salonName },
        { label: 'Contact Person', value: ownerName },
        { label: 'Email', value: ownerEmail },
        { label: 'Location', value: location },
      ],
      'Salon Application'
    );
  }

  async sendSalonApplicationReceived(
    email: string,
    contactName: string,
    salonName: string,
    applicationReference: string,
  ) {
    if (!this.isConfigured) {
      console.log(
        `[DEV] Salon application received email for ${email}: ${applicationReference}`,
      );
      return;
    }

    try {
      const msg = {
        to: email,
        from: this.fromEmail,
        subject: `Salon application received - ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${contactName},`,
          `Your salon profile has been created and is now awaiting admin approval.`,
          [
            { label: 'Salon', value: salonName },
            { label: 'Reference', value: applicationReference },
            { label: 'Status', value: 'Awaiting admin approval' },
          ],
          `Please use this reference together with your salon name whenever you contact admin about your application.`,
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Salon application received email sent to ${email}`);
    } catch (error) {
      console.error(
        '[EMAIL] Failed to send salon application received email:',
        error,
      );
    }
  }

  async notifyAdminNewBeforeAfter(salonName: string, uploadedBy: string) {
    await this.sendAdminNotification(
      '📸 New Before/After Uploaded - Needs Review',
      `A new before/after image has been uploaded.`,
      [
        { label: 'Salon', value: salonName },
        { label: 'Uploaded By', value: uploadedBy },
      ],
      'Before/After'
    );
  }

  private async sendAdminNotification(
    subject: string,
    description: string,
    details: { label: string; value: string }[],
    type: string
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Admin notification: ${subject}`);
      return;
    }

    try {
      const detailsHtml = details
        .map(d => `<tr><td style="padding: 8px 0; color: #666; width: 120px;">${d.label}:</td><td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;">${d.value}</td></tr>`)
        .join('');

      const msg = {
        to: this.adminEmail,
        from: this.fromEmail,
        subject: `[Stylr SA] ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .header { padding: 24px 32px; border-bottom: 1px solid #eee; }
                .header h1 { margin: 0; font-size: 18px; color: #1a1a1a; }
                .content { padding: 24px 32px; }
                .badge { display: inline-block; background: #F51957; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
                .details { width: 100%; border-collapse: collapse; }
                .footer { padding: 16px 32px; background: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #888; }
                .cta { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #F51957; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${subject}</h1>
                </div>
                <div class="content">
                  <span class="badge">${type}</span>
                  <p style="margin: 0 0 16px; color: #666;">${description}</p>
                  <table class="details">
                    ${detailsHtml}
                  </table>
                  <a href="https://stylrsa.co.za/admin" class="cta">View in Admin Panel</a>
                </div>
                <div class="footer">
                  <p style="margin: 0;">Stylr SA Admin Notification</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Admin notification sent: ${subject}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send admin notification:', error);
    }
  }

  // ===== BOOKING EMAIL METHODS =====

  async sendBookingConfirmation(
    userEmail: string,
    userName: string,
    salonName: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Booking confirmation for ${userEmail}`);
      return;
    }

    try {
      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `Booking Request Received - ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${userName},`,
          `Your booking request has been submitted and is awaiting confirmation from the salon.`,
          [
            { label: 'Salon', value: salonName },
            { label: 'Service', value: serviceName },
            { label: 'Date', value: date },
            { label: 'Time', value: time },
          ],
          `You'll receive an email once the salon confirms your appointment.`,
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Booking confirmation sent to ${userEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send booking confirmation:', error);
    }
  }

  async notifySalonNewBooking(
    salonOwnerEmail: string,
    salonOwnerName: string,
    salonName: string,
    customerName: string,
    customerEmail: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Salon booking notification for ${salonOwnerEmail}`);
      return;
    }

    try {
      const msg = {
        to: salonOwnerEmail,
        from: this.fromEmail,
        subject: `📅 New Booking Request - ${serviceName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${salonOwnerName},`,
          `You have a new booking request for ${salonName}. Please review and confirm.`,
          [
            { label: 'Customer', value: customerName },
            { label: 'Email', value: customerEmail },
            { label: 'Service', value: serviceName },
            { label: 'Date', value: date },
            { label: 'Time', value: time },
          ],
          null,
          'View Booking',
          'https://stylrsa.co.za/dashboard/bookings',
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Salon booking notification sent to ${salonOwnerEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send salon booking notification:', error);
    }
  }

  async notifyAdminNewBooking(
    adminEmail: string,
    adminName: string,
    customerName: string,
    customerEmail: string,
    salonName: string,
    serviceName: string,
    date: string,
    time: string,
    totalCost: number,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Admin booking notification for ${adminEmail}`);
      return;
    }

    try {
      const msg = {
        to: adminEmail,
        from: this.fromEmail,
        subject: `🔔 New Booking on Platform - ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${adminName},`,
          `A new booking has been made on the platform. Monitor booking activity for quality assurance.`,
          [
            { label: 'Salon', value: salonName },
            { label: 'Service', value: serviceName },
            { label: 'Customer', value: customerName },
            { label: 'Customer Email', value: customerEmail },
            { label: 'Date', value: date },
            { label: 'Time', value: time },
            { label: 'Total Cost', value: `R${totalCost.toFixed(2)}` },
          ],
          null,
          'View in Admin Dashboard',
          'https://stylrsa.co.za/admin?tab=bookings',
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Admin booking notification sent to ${adminEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send admin booking notification:', error);
    }
  }

  async sendBookingApproved(
    userEmail: string,
    userName: string,
    salonName: string,
    serviceName: string,
    date: string,
    time: string,
    salonAddress?: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Booking approved for ${userEmail}`);
      return;
    }

    try {
      const details = [
        { label: 'Salon', value: salonName },
        { label: 'Service', value: serviceName },
        { label: 'Date', value: date },
        { label: 'Time', value: time },
      ];
      if (salonAddress) {
        details.push({ label: 'Address', value: salonAddress });
      }

      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `✅ Booking Confirmed - ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Great news, ${userName}!`,
          `Your booking has been confirmed. We look forward to seeing you!`,
          details,
          `Please arrive 5-10 minutes before your appointment time.`,
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Booking approved email sent to ${userEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send booking approved email:', error);
    }
  }

  async sendBookingRejected(
    userEmail: string,
    userName: string,
    salonName: string,
    serviceName: string,
    reason?: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Booking rejected for ${userEmail}`);
      return;
    }

    try {
      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `Booking Update - ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${userName},`,
          `Unfortunately, your booking request for ${serviceName} at ${salonName} could not be confirmed.`,
          [],
          reason ? `Reason: ${reason}` : `The salon was unable to accommodate this booking. Please try a different time or contact the salon directly.`,
          'Find Another Time',
          `https://stylrsa.co.za/salons`,
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Booking rejected email sent to ${userEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send booking rejected email:', error);
    }
  }

  /**
   * Send appointment reminder email (24 hours before)
   */
  async sendAppointmentReminder(
    userEmail: string,
    userName: string,
    salonName: string,
    serviceName: string,
    date: string,
    time: string,
    salonAddress?: string,
    professionalName?: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Appointment reminder for ${userEmail}`);
      return;
    }

    try {
      const details = [
        { label: 'Salon', value: salonName },
        { label: 'Service', value: serviceName },
        { label: 'Date', value: date },
        { label: 'Time', value: time },
      ];
      if (professionalName) {
        details.push({ label: 'Professional', value: professionalName });
      }
      if (salonAddress) {
        details.push({ label: 'Address', value: salonAddress });
      }

      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `⏰ Reminder: Appointment Tomorrow at ${salonName}`,
        html: this.getSimpleEmailTemplate(
          `Hi ${userName},`,
          `This is a friendly reminder about your upcoming appointment tomorrow!`,
          details,
          `Please arrive 5-10 minutes before your appointment. If you need to reschedule, please contact the salon as soon as possible.`,
          'View My Bookings',
          'https://stylrsa.co.za/my-bookings',
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Appointment reminder sent to ${userEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send appointment reminder:', error);
    }
  }

  /**
   * Send review request email (24 hours after appointment)
   */
  async sendReviewRequest(
    userEmail: string,
    userName: string,
    salonName: string,
    serviceName: string,
    bookingId: string,
    salonSlug?: string,
  ) {
    if (!this.isConfigured) {
      console.log(`[DEV] Review request for ${userEmail}`);
      return;
    }

    try {
      const reviewUrl = salonSlug
        ? `https://stylrsa.co.za/salons/${salonSlug}?review=true`
        : `https://stylrsa.co.za/my-bookings?action=review&bookingId=${bookingId}`;

      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `⭐ How was your visit to ${salonName}?`,
        html: this.getSimpleEmailTemplate(
          `Hi ${userName},`,
          `We hope you enjoyed your ${serviceName} at ${salonName}! Your feedback helps other customers find great services and helps salons improve.`,
          [
            { label: 'Salon', value: salonName },
            { label: 'Service', value: serviceName },
          ],
          `Sharing your experience only takes a minute and makes a big difference!`,
          'Leave a Review',
          reviewUrl,
        ),
      };
      await this.sendEmail(msg);
      console.log(`[EMAIL] Review request sent to ${userEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send review request:', error);
    }
  }

  private getSimpleEmailTemplate(
    greeting: string,
    message: string,
    details: { label: string; value: string }[],
    footer?: string | null,
    ctaText?: string,
    ctaUrl?: string,
  ): string {
    const detailsHtml = details.length > 0
      ? `<table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          ${details.map(d => `<tr><td style="padding: 8px 0; color: #666; width: 100px;">${d.label}:</td><td style="padding: 8px 0; color: #1a1a1a; font-weight: 500;">${d.value}</td></tr>`).join('')}
        </table>`
      : '';

    const ctaHtml = ctaText && ctaUrl
      ? `<a href="${ctaUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #F51957; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">${ctaText}</a>`
      : '';

    const footerHtml = footer
      ? `<p style="font-size: 13px; color: #888; margin-top: 20px;">${footer}</p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding: 32px;">
              <div style="font-size: 24px; font-weight: 700; color: #F51957; text-align: center; margin-bottom: 24px;">Stylr SA</div>
              <p style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px;">${greeting}</p>
              <p style="font-size: 15px; color: #555; margin-bottom: 16px;">${message}</p>
              ${detailsHtml}
              ${ctaHtml}
              ${footerHtml}
            </div>
            <div style="height: 1px; background: #eee;"></div>
            <div style="text-align: center; padding: 16px; font-size: 12px; color: #888;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Stylr SA</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}



import { Resend } from 'resend';

export type EmailMessage = {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
};

let resendClient: Resend | null = null;

export const resendMailAdapter = {
  setApiKey(apiKey: string) {
    resendClient = new Resend(apiKey);
  },

  async send(message: EmailMessage) {
    if (!resendClient) {
      throw new Error('Resend is not configured');
    }

    const response = await resendClient.emails.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to send email with Resend');
    }

    return response;
  },
};

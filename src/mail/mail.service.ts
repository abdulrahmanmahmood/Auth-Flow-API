import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger();
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendVerificationEmail(
    email: string,
    token: string,
    firstName?: string,
  ) {
    try {
      const expiryMinutes = this.configService.get<string>(
        'VERIFICATION_TOKEN_EXPIRY_MINUTES',
      );
      const expiryTime = expiryMinutes
        ? `${expiryMinutes} minutes`
        : '24 hours';

      await this.mailService.sendMail({
        to: email,
        subject: 'Verify your email',
        template: 'email-verification',
        context: {
          token,
          name: firstName ?? 'there',
          appName: 'Auth Flow',
          verificationUrl: `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`,
          expiresIn: expiryTime,
        },
      });
      this.logger.log('Verification email sent');
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

import { ISendEmail } from './email.interface';
import { config } from 'src/utlils/config/config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;
  private logger = new Logger('EmailService');

  constructor(private configService: ConfigService) {

    this.transporter = nodemailer.createTransport({
      host:configService.get('EMAIL_HOST'),
      port: Number(configService.get('EMAIL_PORT')),
      secure: false,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASS'),
      },
    });

  }

  async sendEmail(values: ISendEmail) {
    try {
      const info = await this.transporter.sendMail({
        from: `"LinkFast eSIM" <${config.email.from}>`,
        to: values.to,
        subject: values.subject,
        html: values.html,
      });

      this.logger.log(
        `Mail sent successfully: ${info.accepted?.join(', ')}`,
      );

      return info;
    } catch (error) {
      this.logger.error('Email send failed', error);
      throw error;
    }
  }
}
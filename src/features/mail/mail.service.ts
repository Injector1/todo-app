import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: any) {
    await this.mailerService.sendMail({
      to: 'injector005@gmail.com',
      subject: 'TEST EMAIL',
      template: './confirmation',
      context: {
        name: user.username,
        url: 'google.com',
      },
    });
  }
}

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailData } from '../../types/mail/mail-data.interface';
import { errorMsgs } from '../../shared/error-messages';
import { mailSubjects } from './mail-subjects';
import { IChangeEmailNotification } from '../../types/mail/change-email-notification.interface';
import { IConfirmEmailChange } from '../../types/mail/confirm-email-change.interface';
import { CreateOfficeOpeningRequestDto } from '../office-opening-requests/dto/create-office-opening-request.dto';
import { IMailTransferCode } from '../../types/mail/mail-transfer-code.interface';
import { IMailInternalTransactionCode } from '../../types/mail/mail-internal-transaction-code.interface';

@Injectable()
export class MailService {
  private _adminEmail: string;
  private _appName: string;
  private _backendDomain: string;
  private _frontendDomain: string;
  private _logoUrl: string;
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this._adminEmail = this.configService.get('app.adminEmail');
    this._backendDomain = this.configService.get('app.backendDomain');
    this._frontendDomain = this.configService.get('app.frontendDomain');
    this._logoUrl = `${this._backendDomain}/static/${this.configService.get(
      'mail.logoFileName',
    )}`;
    this._appName = this.configService.get('app.name');
  }

  /**
   * Send an email to the user with a link to confirm the email
   * @param mailData
   */

  async userSignUp(mailData: MailData) {
    try {
      await this.mailerService.sendMail({
        to: mailData.to,
        subject: `[${this._appName}] ${mailSubjects.confirmEmail}`,
        text: `${this._backendDomain}/auth/email/confirm/${mailData.hash} ${mailSubjects.confirmEmail}`,
        template: './verify-email',
        context: {
          logoUrl: this._logoUrl,
          url: `${this._backendDomain}/auth/email/confirm/${mailData.hash}`,
        },
      });
    } catch (error) {
      this.logger.error(`
      ${errorMsgs.mailSingUpError}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  /**
   * Send an email to the user with a link to confirm changing the email
   * @param mailData
   */

  async changeEmailConfirm({
    newEmail,
    currentEmail,
    hash,
  }: IConfirmEmailChange) {
    await this.mailerService.sendMail({
      to: currentEmail,
      subject: `[${this._appName}] ${mailSubjects.confirmChangingEmail}`,
      text: `${this._backendDomain}/auth/email/change/${hash} ${mailSubjects.confirmChangingEmail}`,
      template: './email-change-verification.hbs',
      context: {
        logoUrl: this._logoUrl,
        currentEmail,
        newEmail,
        url: `${this._backendDomain}/auth/email/change/${hash}`,
      },
    });
  }

  /**
   * Send an email to the user notifying them that their email has changed
   * @param data email data
   */

  async changeEmailNotification({
    newEmail,
    currentEmail,
    hash,
  }: IChangeEmailNotification) {
    await this.mailerService.sendMail({
      to: currentEmail,
      subject: `[${this._appName}] ${mailSubjects.emailChangeNotification}`,
      text: `${this._backendDomain}/auth/email/change/cancel/${hash} ${mailSubjects.emailChangeNotification}`,
      template: './email-change-notification.hbs',
      context: {
        logoUrl: this._logoUrl,
        currentEmail,
        newEmail,
        url: `${this._backendDomain}/auth/email/change/cancel/${hash}`,
      },
    });
  }

  /**
   * Send an email to the user with a link to reset their password
   * @param mailData
   */

  async forgotPassword(mailData: MailData) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: `[${this._appName}] ${mailSubjects.resetPassword}`,
      text: `${this._frontendDomain}/reset-password/${mailData.hash} ${mailSubjects.resetPassword}`,
      template: './reset-password',
      context: {
        logoUrl: this._logoUrl,
        url: `${this._frontendDomain}/reset-password/${mailData.hash}`,
      },
    });
  }

  /**
   * Notifies the client and the administrator about the creation of a request for opening an office
   * @param email client email
   */

  async officeOpeningRequest(data: CreateOfficeOpeningRequestDto) {
    const { email, phone, name, surname, note } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: `[${this._appName}] ${mailSubjects.officeOpeningRequest}`,
      template: './open-office-request.hbs',
      context: {
        logoUrl: this._logoUrl,
      },
    });
    await this.mailerService.sendMail({
      to: this._adminEmail,
      subject: mailSubjects.officeOpeningRequestAdminNotify,
      template: './open-office-request-admin-notify.hbs',
      context: {
        logoUrl: this._logoUrl,
        fullName: `${surname}  ${name}`,
        email,
        phone,
        note,
      },
    });
  }

  /**
   * Send the user an email with a code to confirm the withdrawal
   * @param data
   * @returns void
   */

  public async transferCode({
    email,
    code,
    withdrawalAmount,
    currencyName,
    withdrawalAddress,
  }: IMailTransferCode) {
    await this.mailerService.sendMail({
      to: email,
      subject: `[${this._appName}] ${mailSubjects.withdrawalRequested}`,
      template: './withdrawal-request.hbs',
      context: {
        logoUrl: this._logoUrl,
        withdrawalAmount,
        currencyName,
        // withdrawalAddress,
        code,
      },
    });
  }

  /**
   * Send the user an email with a code to confirm the internal transaction
   * @param data
   * @returns void
   */

  public async internalTransactionCode({
    email,
    code,
    amount,
    userId,
  }: IMailInternalTransactionCode) {
    await this.mailerService.sendMail({
      to: email,
      subject: `[${this._appName}] ${mailSubjects.internalTransferRequest}`,
      template: './internal-transfer-request.hbs',
      context: {
        logoUrl: this._logoUrl,
        amount,
        userId,
        code,
      },
    });
  }
}

import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { IVerifyRecaptchaResponse } from '../../types/recaptcha/verify-recaptcha-response.interface';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class RecaptchaService {
  _recaptchaSecretKey: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: Logger,
  ) {
    this._recaptchaSecretKey = this.configService.get(
      'auth.recaptchaSecretKey',
    );
  }

  /**
   * Verify a user's response to a reCAPTCHA challenge
   * @param recaptchaToken The user response token provided by the reCAPTCHA client-side integration on your site
   * @returns void
   * @throws UnprocessableEntityException
   */

  public async verify(recaptchaToken: string) {
    const params = new URLSearchParams({
      secret: this._recaptchaSecretKey,
      response: recaptchaToken,
    });
    const response = await firstValueFrom<IVerifyRecaptchaResponse>(
      this.httpService
        .post('https://www.google.com/recaptcha/api/siteverify', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          map((response) => response.data),
          catchError(async (error) => {
            this.logger.error(`${errorMsgs.recaptchaFailed}
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
          }),
        ),
    );
    if (!response || !response.success) {
      this.logger.error(`${errorMsgs.recaptchaFailed}
      ${response ? JSON.stringify(response) : ''}`);
      throw new UnprocessableEntityException(errorMsgs.recaptchaFailed);
    }
  }
}

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { errorMsgs } from '../shared/error-messages';

@Injectable()
export class TelegramApiKeyValidationPipe implements PipeTransform {
  private readonly _telegramWebhookToken: string;
  constructor(private readonly configService: ConfigService) {
    this._telegramWebhookToken = this.configService.get(
      'telegramBot.webhookToken',
    );
  }

  async transform(value: string, _metadata: ArgumentMetadata) {
    if (value !== this._telegramWebhookToken) {
      throw new ForbiddenException(errorMsgs.telegramWebhookTokenIncorrect);
    }
    return value;
  }
}

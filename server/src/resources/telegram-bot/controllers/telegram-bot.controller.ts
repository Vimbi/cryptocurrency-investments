/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TelegramBotService } from '../services/telegram-bot.service';
import { GetUser } from '../../../utils/custom-decorators/get-user.decorator';
import { Public } from '../../../utils/custom-decorators/public.decorator';
import { GetHeader } from '../../../utils/custom-decorators/get-header.decorator';
import { ApiKeyNames } from '../../../utils/constants/api-key-names.enum';
import { TelegramApiKeyValidationPipe } from '../../../validation/telegram-api-key-validation-pipe';
import { ITelegramWebhookBody } from '../../../types/telegram-bot/telegram-webhook-body.interface';
import { JwtTwoFactorGuard } from '../../auth/guards/jwt-two-factor.guard';
import { SendMessageHelpdeskDto } from '../dto/send-message-helpdesk.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  sendMessageHeldeskLimit,
  sendMessageHeldeskTTL,
} from '../../../common/config';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Telegram bot')
@Controller({
  path: 'telegram-bot',
  version: '1',
})
export class TelegramBotController {
  constructor(private readonly service: TelegramBotService) {}

  @Get('get-bot-connection-link')
  async getBotConnectionLink(@GetUser('id') userId: string) {
    return await this.service.getBotConnectionLink(userId);
  }

  @Throttle(sendMessageHeldeskTTL, sendMessageHeldeskLimit)
  @Public()
  @Post('send-message-helpdesk')
  async sendMessageHelpdesk(@Body() dto: SendMessageHelpdeskDto) {
    return await this.service.sendMessageHelpdesk(dto);
  }

  @Public()
  @SkipThrottle()
  @Post('webhook')
  async webhook(
    @Body() body: ITelegramWebhookBody,
    @GetHeader(
      ApiKeyNames['x-telegram-bot-api-secret-token'],
      TelegramApiKeyValidationPipe,
    )
    _: string,
  ) {
    return await this.service.webhook(body);
  }
}

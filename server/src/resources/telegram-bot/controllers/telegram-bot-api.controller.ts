import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RoleEnum } from '../../roles/roles.enum';
import { Roles } from '../../roles/roles.decorator';
import { JwtTwoFactorGuard } from '../../auth/guards/jwt-two-factor.guard';
import { TelegramBotApiService } from '../services/telegram-bot-api.service';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@Roles(RoleEnum.superAdmin)
@ApiTags('Telegram bot api')
@Controller({
  path: 'telegram-bot-api',
  version: '1',
})
export class TelegramBotApiController {
  constructor(private readonly service: TelegramBotApiService) {}

  @Get('get-webhook-info')
  async getWebhookInfo() {
    return await this.service.getWebhookInfo();
  }

  @Post('set-webhook')
  async setWebhook() {
    return await this.service.setWebhook();
  }
}

import { Logger, Module, forwardRef } from '@nestjs/common';
import { TelegramBotService } from './services/telegram-bot.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { TelegramBotController } from './controllers/telegram-bot.controller';
import { TelegramBotApiService } from './services/telegram-bot-api.service';
import { TelegramBotApiController } from './controllers/telegram-bot-api.controller';
import { TelegramBotConsumer } from './telegram.processor';
import { BullModule } from '@nestjs/bull';
import { TelegramQueueNameEnum } from './telegram-queue-name.enum';
import { bullTelegramSendMessageOptionsService } from '../../utils/bull-queue-options/telegram-send-message-options.service';

@Module({
  imports: [
    HttpModule.register({}),
    forwardRef(() => UsersModule),
    BullModule.registerQueue(
      bullTelegramSendMessageOptionsService(TelegramQueueNameEnum.sendMessage),
    ),
  ],
  controllers: [TelegramBotController, TelegramBotApiController],
  providers: [
    TelegramBotService,
    TelegramBotApiService,
    Logger,
    TelegramBotConsumer,
  ],
  exports: [TelegramBotService, TelegramBotApiService, TelegramBotConsumer],
})
export class TelegramBotModule {}

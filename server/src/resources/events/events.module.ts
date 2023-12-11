import { Logger, Module } from '@nestjs/common';
import { EventsListener } from './events-listeners';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bull';
import { TelegramQueueNameEnum } from '../telegram-bot/telegram-queue-name.enum';
import { bullTelegramSendMessageOptionsService } from '../../utils/bull-queue-options/telegram-send-message-options.service';

@Module({
  imports: [
    BullModule.registerQueue(
      bullTelegramSendMessageOptionsService(TelegramQueueNameEnum.sendMessage),
    ),
    UsersModule,
  ],
  controllers: [],
  providers: [EventsListener, Logger],
  exports: [],
})
export class EventsModule {}

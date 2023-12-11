import { OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramBotApiService } from './services/telegram-bot-api.service';
import { ITelegramSendMessage } from '../../types/telegram-bot/telegram-send-message.interface';
import { Logger } from '@nestjs/common';
import { TelegramQueueNameEnum } from './telegram-queue-name.enum';

@Processor(TelegramQueueNameEnum.sendMessage)
export class TelegramBotConsumer {
  private readonly _logger = new Logger(TelegramBotConsumer.name);
  constructor(private readonly telegramBotApiService: TelegramBotApiService) {}

  @Process()
  async transferScan({ data }: Job<ITelegramSendMessage>) {
    await this.telegramBotApiService.sendMessage(data);
  }

  @OnQueueError()
  async handleError(job: Job) {
    this._logger.error(`Queue TelegramQueueNameEnum.sendMessage ERROR.
    Reason: ${job.failedReason}
    Job data: ${JSON.stringify(job.data)}
    Stack trace: ${job.stacktrace}`);
  }

  @OnQueueFailed()
  async handleFail(job: Job<ITelegramSendMessage>) {
    this._logger.error(`Queue TelegramQueueNameEnum.sendMessage FAIL.
      Reason: ${job.failedReason}
      Data: ${JSON.stringify(job.data)}
      Stack trace: ${job.stacktrace}`);
  }
}

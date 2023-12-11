import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { errorMsgs } from '../../../shared/error-messages';
import { ITelegramWebhookBody } from '../../../types/telegram-bot/telegram-webhook-body.interface';
import { TelegramMessageEntityTypes } from '../enums/telegram-message-entity-types.enum';
import { commonMsgs } from '../../../shared/messages';
import { SendMessageHelpdeskDto } from '../dto/send-message-helpdesk.dto';
import { InjectQueue } from '@nestjs/bull';
import { TelegramQueueNameEnum } from '../telegram-queue-name.enum';
import { Queue } from 'bull';
import { ITelegramSendMessage } from '../../../types/telegram-bot/telegram-send-message.interface';
import { helpdeskMessage } from '../templates/helpdesk.message';

@Injectable()
export class TelegramBotService {
  private readonly _botName: string;
  private readonly _helpdeskChatId: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    @InjectQueue(TelegramQueueNameEnum.sendMessage)
    private telegramQueue: Queue<ITelegramSendMessage>,
    private readonly usersService: UsersService,
  ) {
    this._botName = this.configService.get('telegramBot.name');
    this._helpdeskChatId = this.configService.get('telegramBot.helpdeskChatId');
  }

  /**
   * Get bot connection link
   * @param userId user id
   * @returns link
   */

  public async getBotConnectionLink(userId: string) {
    await this.usersService.findOneOrFail({ id: userId });
    return {
      link: `https://t.me/${this._botName}?start=${userId}`,
    };
  }

  /**
   * Webhook handler
   * @param body webhook body
   * @return void
   */

  public async webhook(body: ITelegramWebhookBody) {
    try {
      const { message } = body;
      this.logger.log(`Telegram webhook body ${JSON.stringify(body)}`);
      if (message) {
        const { from, chat, text, entities } = message;
        if (entities?.length) {
          const { type } = entities[0];
          if (type === TelegramMessageEntityTypes.bot_command && !from.is_bot) {
            const [botCommand, payload] = text.split(' ');
            if (botCommand === '/start') {
              await this.usersService.systemUpdate(
                { id: payload },
                { telegramChatId: chat.id.toString() },
              );
              await this.telegramQueue.add({
                chat_id: chat.id,
                text: commonMsgs.welcomeBot,
              });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.telegramWebhook}
        Message: ${error.message}
        Stack: ${error.stack}
        Data: ${JSON.stringify(error?.response?.data)}`);
    }
    return;
  }

  /**
   * Send a message to helpdesk
   * @param dto data to send message
   * @return
   */

  public async sendMessageHelpdesk(dto: SendMessageHelpdeskDto) {
    const { name, email, message } = dto;
    await this.telegramQueue.add({
      chat_id: this._helpdeskChatId,
      text: helpdeskMessage({ name, email, message }),
    });
    return { result: true };
  }
}

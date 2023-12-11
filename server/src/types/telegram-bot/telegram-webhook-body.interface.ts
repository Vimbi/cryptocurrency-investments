import { TelegramMessageEntityTypes } from '../../resources/telegram-bot/enums/telegram-message-entity-types.enum';

export interface ITelegramWebhookBody {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      language_code: string;
    };
    chat: {
      id: number;
      first_name?: string;
      type: string;
    };
    date: number;
    text?: string;
    entities?: {
      offset: number;
      length: number;
      type: TelegramMessageEntityTypes;
    }[];
  };
}

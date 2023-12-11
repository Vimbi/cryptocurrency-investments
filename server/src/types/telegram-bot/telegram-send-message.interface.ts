import { TelegramMessageParseMode } from '../../resources/telegram-bot/enums/telegram-message-parse-mode.enum';

export interface ITelegramSendMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: TelegramMessageParseMode;
}

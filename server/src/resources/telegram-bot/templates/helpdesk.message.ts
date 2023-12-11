import { IHelpdeskTelegramMessage } from '../../../types/telegram-bot/helpdesk-message.interface';

export const helpdeskMessage = ({
  name,
  email,
  message,
}: IHelpdeskTelegramMessage) => {
  return `<b>Name:</b> ${name}\n<b>Email:</b> ${email}\n<b>Message:</b> ${message}`;
};

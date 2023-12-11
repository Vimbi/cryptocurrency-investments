import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IWithdrawalTransferCreatedTelegramMessage } from '../../../types/telegram-bot/withdrawal-transfer-created-telegram-message.interface';

export const withdrawalTransferCreatedTelegramMessage = ({
  transferId,
  amount,
  fullName,
  email,
  createdAt,
}: IWithdrawalTransferCreatedTelegramMessage) => {
  return `<b>Withdrawal transfer created</b>\n<b>Transfer id:</b> ${transferId}\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>User:</b> ${fullName}\n<b>User email:</b> ${email}\n<b>Created at:</b> ${createdAt}`;
};

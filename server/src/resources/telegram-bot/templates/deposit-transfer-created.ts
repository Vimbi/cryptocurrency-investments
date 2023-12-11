import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IDepositTransferCreatedTelegramMessage } from '../../../types/telegram-bot/deposit-transfer-created-telegram-message.interface';

export const depositTransferCreatedTelegramMessage = ({
  transferId,
  amount,
  fullName,
  email,
  updatedAt,
  txId,
}: IDepositTransferCreatedTelegramMessage) => {
  return `<b>Deposit transfer created</b>\n<b>Transfer id:</b> ${transferId}\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>User:</b> ${fullName}\n<b>User email:</b> ${email}\n<b>TxID:</b> ${txId}\n<b>Updated at:</b> ${updatedAt}`;
};

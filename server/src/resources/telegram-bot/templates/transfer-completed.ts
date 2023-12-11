import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { ITransferCompletedTelegramMessage } from '../../../types/telegram-bot/transfer-completed-telegram-message.interface';

export const transferCompletedTelegramMessage = ({
  txId,
  amount,
  adminId,
  typeName,
  transferId,
}: ITransferCompletedTelegramMessage) => {
  return `<b>${
    typeName.charAt(0).toUpperCase() + typeName.slice(1)
  } transfer completed</b>\n<b>Transfer id:</b> ${transferId}\n<b>TxID:</b> ${txId}\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>Admin id:</b> ${adminId || 'AUTOMATION'}`;
};

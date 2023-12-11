import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { ITransferProcessedTelegramMessage } from '../../../types/telegram-bot/transfer-processed-telegram-message.interface';

export const transferProcessedTelegramMessage = ({
  txId,
  amount,
  adminId,
  typeName,
  transferId,
}: ITransferProcessedTelegramMessage) => {
  return `<b>Transfer processed</b>\n<b>Type:</b> ${typeName}\n<b>Transfer id:</b> ${transferId}\n<b>TxID:</b> ${txId}\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>Admin id:</b> ${adminId}`;
};

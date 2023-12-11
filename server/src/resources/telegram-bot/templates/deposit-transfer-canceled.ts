import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { IDepositTransferCanceledTelegramMessage } from '../../../types/telegram-bot/deposit-transfer-canceled-telegram-message.interface';

export const depositTransferCanceledTelegramMessage = ({
  txId,
  amount,
  transferId,
  note,
  adminId,
}: IDepositTransferCanceledTelegramMessage) => {
  return `<b>Deposit transfer canceled</b>\n<b>Transfer id:</b> ${transferId}\n<b>TxID:</b> ${txId}\n<b>Amount:</b> ${convertCentsToDollars(
    amount,
  )}$\n<b>Note:</b> ${note}\n<b>Admin id:</b> ${adminId || 'AUTOMATION'}`;
};

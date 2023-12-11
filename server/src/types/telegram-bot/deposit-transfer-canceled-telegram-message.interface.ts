export interface IDepositTransferCanceledTelegramMessage {
  txId: string;
  amount: number;
  transferId: string;
  note: string;
  adminId: string;
}

export interface IDepositTransferCreatedTelegramMessage {
  transferId: string;
  amount: number;
  fullName: string;
  email: string;
  updatedAt: Date;
  txId: string;
}

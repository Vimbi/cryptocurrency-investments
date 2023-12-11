export interface IWithdrawalTransferCreatedTelegramMessage {
  transferId: string;
  amount: number;
  fullName: string;
  email: string;
  createdAt: Date;
}

export interface IDepositTransferCompletedEvent {
  adminId: string;
  amount: number;
  transferId: string;
  txId: string;
  userId: string;
}

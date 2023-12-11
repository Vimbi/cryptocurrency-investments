export interface IWithdrawalTransferCompletedEvent {
  amount: number;
  txId: string;
  userId: string;
  adminId?: string;
  transferId: string;
}

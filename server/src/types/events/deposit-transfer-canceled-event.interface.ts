export interface IDepositTransferCanceledEvent {
  amount: number;
  transferId: string;
  txId: string;
  note: string;
  adminId: string;
}

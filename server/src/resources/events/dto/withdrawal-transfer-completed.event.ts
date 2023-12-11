import { IWithdrawalTransferCompletedEvent } from '../../../types/events/withdrawal-transfer-completed-event.interface';

export class WithdrawalTransferCompletedEvent
  implements IWithdrawalTransferCompletedEvent
{
  amount: number;
  txId: string;
  userId: string;
  adminId: string;
  transferId: string;
  constructor({
    amount,
    txId,
    userId,
    adminId,
    transferId,
  }: IWithdrawalTransferCompletedEvent) {
    this.amount = amount;
    this.txId = txId;
    this.userId = userId;
    this.adminId = adminId;
    this.transferId = transferId;
  }
}

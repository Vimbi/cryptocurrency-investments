import { IDepositTransferCompletedEvent } from '../../../types/events/deposit-transfer-completed-event.interface';

export class DepositTransferCompletedEvent
  implements IDepositTransferCompletedEvent
{
  adminId: string;
  amount: number;
  transferId: string;
  txId: string;
  userId: string;
  constructor({
    txId,
    amount,
    userId,
    adminId,
    transferId,
  }: IDepositTransferCompletedEvent) {
    this.adminId = adminId;
    this.txId = txId;
    this.amount = amount;
    this.userId = userId;
    this.transferId = transferId;
  }
}

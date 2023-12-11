import { IDepositTransferCanceledEvent } from '../../../types/events/deposit-transfer-canceled-event.interface';

export class DepositTransferCanceledEvent
  implements IDepositTransferCanceledEvent
{
  amount: number;
  transferId: string;
  txId: string;
  note: string;
  adminId: string;
  constructor({
    txId,
    amount,
    note,
    transferId,
    adminId,
  }: IDepositTransferCanceledEvent) {
    this.txId = txId;
    this.amount = amount;
    this.note = note;
    this.transferId = transferId;
    this.adminId = adminId;
  }
}

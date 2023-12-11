import { ITransferProcessedEvent } from '../../../types/events/transfer-processed-event.interface';

export class TransferProcessedEvent implements ITransferProcessedEvent {
  adminId: string;
  amount: number;
  transferId: string;
  txId: string;
  type: string;
  constructor({
    adminId,
    amount,
    transferId,
    txId,
    type,
  }: ITransferProcessedEvent) {
    this.adminId = adminId;
    this.amount = amount;
    this.transferId = transferId;
    this.txId = txId;
    this.type = type;
  }
}

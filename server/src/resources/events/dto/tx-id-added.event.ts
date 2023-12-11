import { ITxIdAddedEvent } from '../../../types/events/tx-id-added-event.interface';

export class TxIdAddedEvent implements ITxIdAddedEvent {
  id: string;
  txId: string;
  updatedAt: Date;
  transferTypeName: string;
  userId: string;
  amount: number;
  constructor({
    id,
    txId,
    updatedAt,
    transferTypeName,
    amount,
    userId,
  }: ITxIdAddedEvent) {
    this.id = id;
    this.txId = txId;
    this.updatedAt = updatedAt;
    this.transferTypeName = transferTypeName;
    this.amount = amount;
    this.userId = userId;
  }
}

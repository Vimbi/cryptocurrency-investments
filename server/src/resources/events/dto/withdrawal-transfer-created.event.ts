import { IWithdrawalTransferCreatedEvent } from '../../../types/events/withdrawal-transfer-created-event.interface';

export class WithdrawalTransferCreatedEvent
  implements IWithdrawalTransferCreatedEvent
{
  id: string;
  amount: number;
  createdAt: Date;
  userId: string;
  constructor({
    id,
    amount,
    createdAt,
    userId,
  }: IWithdrawalTransferCreatedEvent) {
    this.id = id;
    this.amount = amount;
    this.createdAt = createdAt;
    this.userId = userId;
  }
}

export interface ITxIdAddedEvent {
  id: string;
  txId: string;
  updatedAt: Date;
  transferTypeName: string;
  userId: string;
  amount: number;
}

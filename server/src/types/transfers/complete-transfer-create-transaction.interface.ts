import { EntityManager } from 'typeorm';

export interface ICompleteTransferCreateTransaction {
  manager: EntityManager;
  id: string;
  userId: string;
  amount: number;
  typeId: string;
  txId: string;
  adminId?: string;
}

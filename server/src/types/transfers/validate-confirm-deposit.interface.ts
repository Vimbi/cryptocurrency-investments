import { Transaction } from '../../resources/transactions/entities/transaction.entity';

export interface IValidateConfirmDeposit {
  txId: string;
  typeName: string;
  transaction: Transaction;
  completedAt: Date;
}

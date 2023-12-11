import { EntityManager } from 'typeorm';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';

export interface IGetTransactionsAmount {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
  transactionTypeName: TransactionTypeEnum;
}

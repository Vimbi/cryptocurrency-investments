import { EntityManager } from 'typeorm';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';
import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';

export interface IGetTransfersSum {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
  transactionTypeName: TransactionTypeEnum;
  transferTypeName: TransferTypeEnum;
}

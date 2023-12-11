import { InvestmentTransaction } from '../../resources/investments-transactions/entities/investment-transaction.entity';
import { TransactionType } from '../../resources/transaction-types/entities/transaction-type.entity';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';
import { Transaction } from '../../resources/transactions/entities/transaction.entity';
import { ICreateCancelationInvestmentTransactions } from '../../types/investments/create-cancelation-investment-transactions.interface';

export const createCancelationInvestmentTransactions = async ({
  manager,
  investmentId,
  withdrawalAmount,
  userId,
  fineAmount,
}: ICreateCancelationInvestmentTransactions) => {
  const depositType = await manager.findOneByOrFail(TransactionType, {
    name: TransactionTypeEnum.deposit,
  });
  const withdrawalType = await manager.findOneByOrFail(TransactionType, {
    name: TransactionTypeEnum.withdrawal,
  });
  const fineType = await manager.findOneByOrFail(TransactionType, {
    name: TransactionTypeEnum.fine,
  });

  await manager.insert(InvestmentTransaction, {
    investmentId,
    amount: fineAmount,
    typeId: fineType.id,
  });

  const withdrawalInvestmentTransactionInsertResult = await manager.insert(
    InvestmentTransaction,
    {
      investmentId,
      amount: withdrawalAmount,
      typeId: withdrawalType.id,
    },
  );
  const withdrawalInvestmentTransactionId =
    withdrawalInvestmentTransactionInsertResult.identifiers[0].id;
  const createdTransaction = manager.create(Transaction, {
    userId,
    amount: withdrawalAmount,
    typeId: depositType.id,
    investmentTransactionId: withdrawalInvestmentTransactionId,
  });
  await manager.save(Transaction, createdTransaction);
};

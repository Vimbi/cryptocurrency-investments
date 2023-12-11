import { InvestmentTransaction } from '../../resources/investments-transactions/entities/investment-transaction.entity';
import { TransactionType } from '../../resources/transaction-types/entities/transaction-type.entity';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';
import { Transaction } from '../../resources/transactions/entities/transaction.entity';
import { ICreateDepositInvestmentTransactions } from '../../types/investments/create-deposit-investment-transactions.interface';

export const createDepositInvestmentTransactions = async ({
  manager,
  investmentId,
  amount,
  userId,
}: ICreateDepositInvestmentTransactions) => {
  const depositType = await manager.findOneByOrFail(TransactionType, {
    name: TransactionTypeEnum.deposit,
  });
  const withdrawalType = await manager.findOneByOrFail(TransactionType, {
    name: TransactionTypeEnum.withdrawal,
  });

  const investmentTransactionInsertResult = await manager.insert(
    InvestmentTransaction,
    {
      investmentId,
      amount,
      typeId: depositType.id,
    },
  );
  const investmentTransactionId =
    investmentTransactionInsertResult.identifiers[0].id;

  const createdTransaction = manager.create(Transaction, {
    userId,
    amount,
    typeId: withdrawalType.id,
    investmentTransactionId,
  });
  await manager.save(Transaction, createdTransaction);
};

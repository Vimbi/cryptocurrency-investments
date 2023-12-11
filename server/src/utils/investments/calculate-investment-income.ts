import { InvestmentTransaction } from '../../resources/investments-transactions/entities/investment-transaction.entity';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';

export const calculateInvestmentIncome = (
  investmentTransactions: InvestmentTransaction[],
) => {
  return investmentTransactions.reduce((accumulator, investmentTransaction) => {
    const sign =
      investmentTransaction.type.name === TransactionTypeEnum.income ? 1 : 0;
    return accumulator + sign * investmentTransaction.amount;
  }, 0);
};

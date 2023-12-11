import { TransactionTypeEnum } from './transaction-type.enum';

export const TransactionTypesRu = {
  [TransactionTypeEnum.deposit]: 'Пополнение',
  [TransactionTypeEnum.withdrawal]: 'Вывод',
  [TransactionTypeEnum.reward]: 'Реферальное вознаграждение',
  [TransactionTypeEnum.income]: '% за день',
  [TransactionTypeEnum.fine]: 'Штраф',
};

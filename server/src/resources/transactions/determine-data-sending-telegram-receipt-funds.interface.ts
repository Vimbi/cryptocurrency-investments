import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';

export interface IDetermineDataSendingTelegramReceiptFunds {
  telegramChatId: string;
  transactionTypeName: TransactionTypeEnum;
  userId: string;
  investmentTransactionId: string;
  amount: number;
  investmentId: string;
  referralLevelPercentage: number;
  createdAt: Date;
}

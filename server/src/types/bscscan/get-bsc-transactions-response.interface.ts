import { IBscTransactionInfo } from './bsc-transaction-info.interface';

export interface IGetBscTransactionsResponse {
  status: number;
  message: string;
  result: IBscTransactionInfo[];
}

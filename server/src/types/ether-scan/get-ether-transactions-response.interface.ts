import { IEtherTransactionInfo } from './ether-transaction-info.interface';

export interface IGetEtherTransactionsResponse {
  status: number;
  message: string;
  result: IEtherTransactionInfo[];
}

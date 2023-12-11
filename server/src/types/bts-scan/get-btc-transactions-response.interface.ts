import { IBtcTransactionInfo } from './btc-transaction-info.interface';

export interface IGetBtcTransactionsResponse {
  txid: string;
  version: number;
  locktime: number;
  vin: [];
  vout: IBtcTransactionInfo[];
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

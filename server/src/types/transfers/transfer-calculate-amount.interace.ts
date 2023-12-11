import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';

export interface ITransferCalculateAmount {
  amount?: number;
  currencyAmount?: number;
  fixedCurrencyRateId: string;
  transferType: TransferTypeEnum;
  userId: string;
}

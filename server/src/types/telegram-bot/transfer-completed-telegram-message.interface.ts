import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';

export interface ITransferCompletedTelegramMessage {
  txId: string;
  amount: number;
  adminId: string;
  transferId: string;
  typeName: TransferTypeEnum;
}

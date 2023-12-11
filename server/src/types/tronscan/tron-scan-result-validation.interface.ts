import { NetworkTokenTypeEnum } from '../../resources/networks/network-token-type.enum';
import { TronscanTokenTransferInfo } from './tron-scan-token-transfer-info.interface';

export interface ITronscanResultValidation {
  tokenTransferInfo: TronscanTokenTransferInfo;
  currencySymbol: string;
  depositAddress: string;
  networkTokenType: NetworkTokenTypeEnum;
  currencyAmount: number;
  fromAddress: string;
}

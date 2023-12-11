import { NetworkTokenTypeEnum } from '../../resources/networks/network-token-type.enum';

export interface ITransferValidationInScanQueue {
  typeName: string;
  networkTokenType: NetworkTokenTypeEnum;
  txId: string;
}

import { TronscanTokenTransferInfo } from './tron-scan-token-transfer-info.interface';

export interface IGetTronTransactionResponse {
  contract_map: {
    [key: string]: boolean;
  };
  contractRet: string; //'SUCCESS'
  data: string;
  contractInfo: {
    TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: {
      isToken: true;
      tag1: 'USDT Token';
      tag1Url: 'https://tron.network/usdt';
      name: 'TetherToken';
      risk: false;
      vip: true;
    };
  };
  contractType: number;
  event_count: number;
  project: string;
  toAddress: string;
  confirmed: true;
  trc20TransferInfo: [
    {
      icon_url: string;
      symbol: string; // 'USDT'
      level: string;
      to_address: string; // !!!! need
      contract_address: string;
      type: string; // 'Transfer'
      decimals: number;
      name: string;
      vip: boolean;
      tokenType: string; //trc20
      from_address: string;
      amount_str: string; //119000000 (119)
      status: number;
    },
  ];
  transfersAllList: [
    {
      icon_url: string;
      symbol: string; // 'USDT'
      level: string;
      to_address: string; // !!!! need
      contract_address: string;
      type: string; // 'Transfer'
      decimals: number;
      name: string;
      vip: boolean;
      tokenType: string; //trc20
      from_address: string;
      amount_str: string; //'119000000' (119)
      status: number;
    },
  ];
  block: number;
  triggerContractType: number;
  riskTransaction: boolean;
  timestamp: number; //1697615427000
  normalAddressInfo: {
    [key: string]: {
      risk: boolean;
    };
  };
  cost: {
    multi_sign_fee: number;
    net_fee: number;
    energy_penalty_total: number;
    net_fee_cost: number;
    energy_usage: number;
    fee: number;
    energy_fee_cost: number;
    energy_fee: number;
    energy_usage_total: number;
    memoFee: number;
    origin_energy_usage: number;
    net_usage: number;
  };
  addressTag: {
    [key: string]: string;
  };
  revert: boolean;
  confirmations: number;
  fee_limit: number;
  tokenTransferInfo: TronscanTokenTransferInfo;
  // {
  //   icon_url: string;
  //   symbol: string; // 'USDT'
  //   level: string;
  //   to_address: string; // !!!! need
  //   contract_address: string;
  //   type: string; // 'Transfer'
  //   decimals: number;
  //   name: string;
  //   vip: boolean;
  //   tokenType: string; //trc20
  //   from_address: string;
  //   amount_str: string; //119000000 (119)
  //   status: number;
  // };
  contract_type: string; //trc20
  trigger_info: {
    method: string;
    parameter: {
      _value: string;
      _to: string;
    };
    methodId: string;
    contract_address: string;
    call_value: number;
  };
  signature_addresses: [];
  ownerAddress: string;
  srConfirmList: [
    {
      address: string;
      name: string;
      block: number;
      url: string;
    },
  ];
  hash: string; // txId
  contractData: {
    data: string;
    owner_address: string;
    contract_address: string;
  };
}

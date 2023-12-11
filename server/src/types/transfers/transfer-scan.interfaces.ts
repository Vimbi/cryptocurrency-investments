import { EntityManager } from 'typeorm';
import { NetworkTokenTypeEnum } from '../../resources/networks/network-token-type.enum';

export type TTransferScan =
  | ITransferScanTron
  | ITransferScanBtc
  | ITransferScanEther
  | ITransferScanBsc;

export interface ITransferScanTron {
  txId: string;
  currencyAmount: number;
  depositAddress: string;
  manager: EntityManager;
  transferId: string;
  amount: number;
  userId: string;
  currencySymbol: string;
  tokenType: NetworkTokenTypeEnum;
  fromAddress: string;
}

export interface ITransferScanBtc {
  txId: string;
  currencyAmount: number;
  depositAddress: string;
  manager: EntityManager;
  transferId: string;
  amount: number;
  userId: string;
}

export interface ITransferScanEther {
  txId: string;
  currencyAmount: number;
  depositAddress: string;
  manager: EntityManager;
  transferId: string;
  amount: number;
  userId: string;
  fromAddress: string;
}

export interface ITransferScanBsc {
  txId: string;
  currencyAmount: number;
  depositAddress: string;
  manager: EntityManager;
  transferId: string;
  amount: number;
  userId: string;
  fromAddress: string;
}

import { IFindOptions } from '../find-options.interface';

export interface IFindUserWallets extends IFindOptions {
  userId: string;
  networkId?: string;
}

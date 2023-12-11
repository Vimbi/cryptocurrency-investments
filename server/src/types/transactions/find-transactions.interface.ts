import { IFindOptions } from '../find-options.interface';

export interface IFindTransactions extends IFindOptions {
  userId?: string;
  afterDate?: Date;
  beforeDate?: Date;
  localeId: string;
  typeId?: string;
}

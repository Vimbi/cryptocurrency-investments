import { IFindOptions } from '../find-options.interface';

export interface IFindInvestmentsTransactions extends IFindOptions {
  userId?: string;
  afterDate?: Date;
  beforeDate?: Date;
  typeId?: string;
  localeId?: string;
}

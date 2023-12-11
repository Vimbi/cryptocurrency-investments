export interface IGetTransfers {
  userId?: string;
  sort?: string[][];
  page: number;
  limit: number;
  statusId?: string;
  typeId?: string;
  currencyId?: string;
  afterDate?: Date;
  beforeDate?: Date;
  localeId?: string;
  networkId?: string;
}

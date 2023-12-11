export interface IFindInvestments {
  userId?: string;
  sort?: string[][];
  page: number;
  limit: number;
  afterDate?: Date;
  beforeDate?: Date;
}

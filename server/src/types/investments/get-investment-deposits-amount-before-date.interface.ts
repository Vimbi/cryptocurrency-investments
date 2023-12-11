import { EntityManager } from 'typeorm';

export interface IGetInvestmentDepositsAmountBeforeDate {
  investmentId: string;
  date?: Date;
  manager: EntityManager;
}

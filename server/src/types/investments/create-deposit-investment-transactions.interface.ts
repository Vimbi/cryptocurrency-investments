import { EntityManager } from 'typeorm';

export interface ICreateDepositInvestmentTransactions {
  manager: EntityManager;
  investmentId: string;
  amount: number;
  userId: string;
}

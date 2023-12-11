import { EntityManager } from 'typeorm';

export interface ICreateCancelationInvestmentTransactions {
  manager: EntityManager;
  investmentId: string;
  userId: string;
  withdrawalAmount: number;
  fineAmount: number;
}

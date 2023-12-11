import { EntityManager } from 'typeorm';

export interface IValidateReplenishInvestment {
  manager: EntityManager;
  userId: string;
  amount: number;
}

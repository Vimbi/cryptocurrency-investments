import { EntityManager } from 'typeorm';

export interface IValidateInvestmentCreation {
  manager: EntityManager;
  userId: string;
  amount: number;
}

import { EntityManager } from 'typeorm';

export interface ITryUpdateInvestmentProduct {
  manager: EntityManager;
  currentProductId: string;
  investmentId: string;
}

import { EntityManager } from 'typeorm';

export interface IGetAmountReceivedFromInvestments {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
}

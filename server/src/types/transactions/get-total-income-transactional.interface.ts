import { EntityManager } from 'typeorm';

export interface IGetTotalIncome {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
}

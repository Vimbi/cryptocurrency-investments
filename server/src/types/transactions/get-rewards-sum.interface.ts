import { EntityManager } from 'typeorm';

export interface IGetRewardsSum {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
}

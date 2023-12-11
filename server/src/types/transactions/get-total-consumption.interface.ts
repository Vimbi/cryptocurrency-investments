import { EntityManager } from 'typeorm';

export interface IGetTotalConsumption {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
  isAccountStatement: boolean;
}

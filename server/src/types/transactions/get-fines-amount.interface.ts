import { EntityManager } from 'typeorm';

export interface IGetFinesAmount {
  manager: EntityManager;
  userId: string;
  afterDate?: Date;
  beforeDate?: Date;
}

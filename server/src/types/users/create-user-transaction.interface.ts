import { EntityManager } from 'typeorm';
import { ICreateUser } from './create-user.interface';

export interface ICreateUserTransaction extends ICreateUser {
  entityManager: EntityManager;
  hash?: string;
  parentId?: string;
}

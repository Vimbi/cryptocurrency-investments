import { EntityManager } from 'typeorm';

export interface IGiveReward {
  manager: EntityManager;
  level: number;
  parentId: string;
  investmentId: string;
  typeId: string;
  amount: number;
}

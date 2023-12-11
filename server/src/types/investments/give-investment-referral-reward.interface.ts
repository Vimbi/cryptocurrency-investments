import { EntityManager } from 'typeorm';

export interface IGiveInvestmentReferralReward {
  manager: EntityManager;
  userId: string;
  amount: number;
  investmentId: string;
}

import { registerAs } from '@nestjs/config';

export default registerAs('transaction', () => ({
  minInternalTransactionLimit:
    parseInt(process.env.TRANSACTION_MIN_INTERNAL_TRANSACTION_LIMIT, 10) ||
    5000,
  maxInternalTransactionLimit:
    parseInt(process.env.TRANSACTION_MAX_INTERNAL_TRANSACTION_LIMIT, 10) ||
    5000000,
  codeLength: parseInt(process.env.TRANSACTION_CODE_LENGTH, 10) || 6,
  codeLifespan: parseInt(process.env.TRANSACTION_CODE_LIFE_SPAN, 10) || 30,
  codeDeletionCron: process.env.TRANSACTION_CODE_DELETION_CRON,
}));

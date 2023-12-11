import { registerAs } from '@nestjs/config';

export default registerAs('transfer', () => ({
  maxDepositLimit: parseInt(process.env.TRANSFER_MAX_DEPOSIT_LIMIT, 10) || 1000,
  minDepositLimit: parseInt(process.env.TRANSFER_MIN_DEPOSIT_LIMIT, 10) || 50,
  minWithdrawalLimit:
    parseInt(process.env.TRANSFER_MIN_WITHDRAWAL_LIMIT, 10) || 50,
  lifeSpan: parseInt(process.env.TRANSFER_LIFESPAN, 10) || 1,
  depositMaxRequestsPerDay:
    parseInt(process.env.TRANSFER_DEPOSIT_MAX_REQUESTS_PER_DAY, 10) || 5,
  cronDepositCancelExpired: process.env.TRANSFER_DEPOSIT_CANCEL_EXPIRED,
  codeLength: parseInt(process.env.TRANSFER_CODE_LENGTH, 10) || 6,
  codeLifespan: parseInt(process.env.TRANSFER_CODE_LIFE_SPAN, 10) || 30,
  codeDeletionCron: process.env.TRANSFER_CODE_DELETION_CRON,
  processingMaxAttemptsLimit:
    parseInt(process.env.TRANSFER_PROCESSING_MAX_ATTEMPTS_LIMIT, 10) || 5,
  cronDepositTransfersProcessing: process.env.TRANSFER_CRON_DEPOSIT_PROCESSING,
}));

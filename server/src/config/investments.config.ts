import { registerAs } from '@nestjs/config';

export default registerAs('investments', () => ({
  term: parseInt(process.env.INVESTMENTS_TERM, 10) || 30,
  payrollTime: parseInt(process.env.INVESTMENTS_PAYROLL_TIME, 10) || 18,
  minAmount: parseInt(process.env.INVESTMENTS_MIN_AMOUNT, 10) || 5000, // cents
  maxAmount: parseInt(process.env.INVESTMENTS_MAX_AMOUNT, 10) || 5000, // cents
  cronIncomeAccrual: process.env.INVESTMENTS_CRON_INCOME_ACCRUAL,
  investmentAmountSnapshotTime: process.env.INVESTMENTS_AMOUNT_SNAPSHOT_TIME,
  cronInvestmentsComplete: process.env.INVESTMENTS_CRON_INVESTMENTS_COMPLETE,
}));

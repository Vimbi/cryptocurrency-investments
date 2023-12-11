import { registerAs } from '@nestjs/config';

export default registerAs('accountStatement', () => ({
  cronClosingPeriod: process.env.ACCOUNT_STATEMENT_CRON_CLOSING_PERIOD,
}));

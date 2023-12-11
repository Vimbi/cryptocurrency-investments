import { registerAs } from '@nestjs/config';

export default registerAs('fixedCurrencyRate', () => ({
  cronDeleteExpired: process.env.FIXED_CURRENCY_RATE_CRON_DELETE_EXPIRED,
  lifeSpan: parseInt(process.env.FIXED_CURRENCY_RATE_LIFE_SPAN, 10) || 30,
}));

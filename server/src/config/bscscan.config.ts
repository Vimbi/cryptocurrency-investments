import { registerAs } from '@nestjs/config';

export default registerAs('bscscan', () => ({
  apiKey: process.env.BSCSCAN_API_KEY,
  minConfirmationsLimit:
    parseInt(process.env.BSCSCAN_MIN_CONFIRMATIONS_LIMIT, 10) || 15,
}));

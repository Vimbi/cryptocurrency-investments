import { registerAs } from '@nestjs/config';

export default registerAs('ether-scan', () => ({
  apiKey: process.env.ETHER_SCAN_API_KEY,
  minConfirmationsLimit:
    parseInt(process.env.ETHER_SCAN_MIN_CONFIRMATIONS_LIMIT, 10) || 6,
}));

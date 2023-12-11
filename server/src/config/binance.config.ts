import { registerAs } from '@nestjs/config';

export default registerAs('binance', () => ({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
}));

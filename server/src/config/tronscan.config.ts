import { registerAs } from '@nestjs/config';

export default registerAs('tronscan', () => ({
  apiKey: process.env.TRONSCAN_API_KEY,
}));

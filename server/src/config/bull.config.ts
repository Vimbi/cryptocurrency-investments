import { registerAs } from '@nestjs/config';

export default registerAs('bull', () => ({
  redisHost: process.env.BULL_REDIS_HOST,
  redisPort: parseInt(process.env.BULL_REDIS_PORT, 10) || 6379,
}));

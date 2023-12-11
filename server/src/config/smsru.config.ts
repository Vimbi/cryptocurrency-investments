import { registerAs } from '@nestjs/config';

export default registerAs('smsru', () => ({
  baseUrl: process.env.SMSRU_BASE_URL,
  apiId: process.env.SMSRU_API_ID,
}));

import { registerAs } from '@nestjs/config';

export default registerAs('userWallets', () => ({
  maxLimit: parseInt(process.env.USER_WALLETS_MAX_LIMIT, 10) || 5,
}));

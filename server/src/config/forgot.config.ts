import { registerAs } from '@nestjs/config';

export default registerAs('forgot', () => ({
  lifeSpan: process.env.FORGOT_PASSWORD_HASH_LIFESPAN,
  cronForgotDeletion: process.env.FORGOT_PASSWORD_HASH_DELETION_CRON,
}));

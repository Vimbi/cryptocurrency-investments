import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_JWT_SECRET,
  secretRefreshToken: process.env.AUTH_JWT_REFRESH_SECRET,
  expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
  refreshTokenExpires: process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
  saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
  codeLifespan: parseInt(process.env.AUTH_CODE_LIFESPAN) || 2,
  hashExpires: process.env.AUTH_HASH_EXPIRES_IN,
  smsCodeLength: parseInt(process.env.AUTH_SMS_CODE_LENGTH, 10) || 6,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
}));

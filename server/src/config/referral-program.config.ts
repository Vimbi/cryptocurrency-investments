import { registerAs } from '@nestjs/config';

export default registerAs('referralProgram', () => ({
  maxLevel: parseInt(process.env.REFERRAL_PROGRAM_MAX_LEVEL, 10) || 10,
  codeLength: parseInt(process.env.REFERRAL_PROGRAM_CODE_LENGTH, 10) || 9,
  totalPercentageMaxLimit:
    parseInt(process.env.REFERRAL_PROGRAM_TOTAL_PERCENTAGE_MAX_LIMIT, 10) || 13,
}));

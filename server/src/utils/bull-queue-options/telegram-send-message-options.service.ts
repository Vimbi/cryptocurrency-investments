import { BullModuleOptions } from '@nestjs/bull';

export const bullTelegramSendMessageOptionsService = (
  name: string,
): BullModuleOptions => ({
  name,
  defaultJobOptions: {
    attempts: 10,
    backoff: {
      type: 'fixed',
      delay: 60000,
    },
  },
  limiter: {
    max: 1,
    duration: 1000,
    bounceBack: false,
  },
});

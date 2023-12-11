import { BullModuleOptions } from '@nestjs/bull';

export const bullTransferScanOptionsService = (
  name: string,
): BullModuleOptions => ({
  name,
  defaultJobOptions: { attempts: 0 },
  limiter: {
    max: 1,
    duration: 1000,
    bounceBack: false,
  },
});

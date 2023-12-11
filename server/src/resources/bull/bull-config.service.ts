import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: this.configService.get('bull.redisHost'),
        port: this.configService.get('bull.redisPort'),
      },
    };
  }
}

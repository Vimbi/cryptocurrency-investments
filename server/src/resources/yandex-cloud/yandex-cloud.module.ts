import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YandexCloudService } from './yandex-cloud.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [YandexCloudService],
  exports: [YandexCloudService],
})
export class YandexCloudModule {}

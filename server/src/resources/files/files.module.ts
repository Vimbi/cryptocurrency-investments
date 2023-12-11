import { Logger, Module } from '@nestjs/common';
import { File } from './entities/file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { YandexCloudModule } from '../yandex-cloud/yandex-cloud.module';
import { HttpModule } from '@nestjs/axios';
import { FilesController } from './files.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    HttpModule.register({}),
    YandexCloudModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, Logger],
  exports: [FilesService],
})
export class FilesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { TransferTypesService } from './transfer-types.service';
import { TransferTypesController } from './transfer-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransferType])],
  controllers: [TransferTypesController],
  providers: [TransferTypesService],
  exports: [TransferTypesService],
})
export class TransferTypesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferStatus } from './entities/transfer-status.entity';
import { TransferStatusesController } from './transfer-statuses.controller';
import { TransferStatusesService } from './transfer-statuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferStatus])],
  controllers: [TransferStatusesController],
  providers: [TransferStatusesService],
  exports: [TransferStatusesService],
})
export class TransferStatusesModule {}

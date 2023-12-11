import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferInfo } from './entitites/transfer-info.entity';
import { TransferInfoService } from './transfer-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferInfo])],
  controllers: [],
  providers: [TransferInfoService],
  exports: [TransferInfoService],
})
export class TransferInfoModule {}

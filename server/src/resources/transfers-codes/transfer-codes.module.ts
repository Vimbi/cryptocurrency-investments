import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferCode } from './entities/transfer-code.entity';
import { TransferCodesService } from './transfer-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferCode])],
  providers: [TransferCodesService, Logger],
  exports: [TransferCodesService],
})
export class TransferCodesModule {}

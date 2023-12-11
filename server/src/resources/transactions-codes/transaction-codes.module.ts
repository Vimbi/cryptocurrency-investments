import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCode } from './entities/transaction-code.entity';
import { TransactionCodesService } from './transaction-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionCode])],
  providers: [TransactionCodesService, Logger],
  exports: [TransactionCodesService],
})
export class TransactionCodesModule {}

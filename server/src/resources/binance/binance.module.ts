import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';

@Module({
  imports: [],
  controllers: [],
  providers: [BinanceService],
  exports: [BinanceService],
})
export class BinanceModule {}

import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Currency]), BinanceModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService, Logger],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}

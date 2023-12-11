import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedCurrencyRate } from './entities/fixed-currency-rate.entity';
import { FixedCurrencyRatesController } from './fixed-currency-rates.controller';
import { FixedCurrencyRatesService } from './fixed-currency-rates.service';
import { NetworksModule } from '../networks/networks.module';
import { CurrenciesModule } from '../currencies/currencies.module';

@Module({
  imports: [
    CurrenciesModule,
    TypeOrmModule.forFeature([FixedCurrencyRate]),
    NetworksModule,
  ],
  controllers: [FixedCurrencyRatesController],
  providers: [FixedCurrencyRatesService, Logger],
  exports: [FixedCurrencyRatesService],
})
export class FixedCurrencyRatesModule {}

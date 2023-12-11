import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Binance from 'binance-api-node';
import { CurrenciesSymbolsEnum } from '../currencies/currencies-symbols.enum';

@Injectable()
export class BinanceService {
  private _apiKey: string;
  private _apiSecret: string;
  constructor(private configService: ConfigService) {
    this._apiKey = this.configService.get('binance.apiKey');
    this._apiSecret = this.configService.get('binance.apiSecret');
  }

  /**
   * Initializes Stripe
   * @param isTestUser an optional parameter that determines whether the user is a test user
   * @returns Stripe
   */

  private _initialBinance() {
    return Binance({
      apiKey: this._apiKey,
      apiSecret: this._apiSecret,
    });
  }

  /**
   * Get currency rate
   * @returns rate
   */

  public async getRate(symbol: string) {
    const client = this._initialBinance();
    const ticker = `${symbol}${CurrenciesSymbolsEnum.USDT}`;
    const response = await client.prices({
      symbol: ticker,
    });
    return Number(response[ticker]);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { IGetTronTransactionResponse } from '../../types/tronscan/get-tron-transaction-response.interface';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class TronscanService {
  private readonly _apiKey: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {
    this._apiKey = this.configService.get('tronscan.apiKey');
  }

  /**
   * Get blockchain transaction by hash
   * @param hash transaction hash
   * @returns result
   */

  async getTransaction(hash: string) {
    return await firstValueFrom<IGetTronTransactionResponse>(
      this.httpService
        .get('https://apilist.tronscanapi.com/api/transaction-info', {
          headers: {
            'TRON-PRO-API-KEY': this._apiKey,
          },
          params: {
            hash,
          },
        })
        .pipe(
          map((response) => response.data),
          catchError(async (error) => {
            this.logger.error(`${errorMsgs.tronScan}
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
          }),
        ),
    );
  }
}

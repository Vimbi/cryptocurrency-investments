import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { IGetBscTransactionsResponse } from '../../types/bscscan/get-bsc-transactions-response.interface';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class BscscanService {
  private readonly _apiKey: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {
    this._apiKey = this.configService.get('bscscan.apiKey');
  }

  /**
   * Get blockchain transaction by hash
   * @param hash transaction hash
   * @returns result
   */

  async getTransaction({ hash, address }: { hash: string; address: string }) {
    const response = await firstValueFrom<IGetBscTransactionsResponse>(
      this.httpService
        .get('https://api.bscscan.com/api', {
          params: {
            apikey: this._apiKey,
            module: 'account',
            action: 'txlist',
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: 1000,
            sort: 'desc',
            address,
          },
        })
        .pipe(
          map((response) => response.data),
          catchError(async (error) => {
            this.logger.error(`${errorMsgs.bscScan}
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
          }),
        ),
    );
    const transaction = response?.result?.find(
      (transaction) => transaction.hash === hash,
    );
    return transaction;
  }
}

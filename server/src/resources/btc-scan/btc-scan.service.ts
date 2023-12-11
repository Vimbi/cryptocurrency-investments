import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { errorMsgs } from '../../shared/error-messages';
import { IGetBtcTransactionsResponse } from '../../types/bts-scan/get-btc-transactions-response.interface';

@Injectable()
export class BtcScanService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {}

  /**
   * Get blockchain transaction by hash
   * @param hash transaction hash
   * @returns result
   */

  async getTransaction({ hash }: { hash: string }) {
    return await firstValueFrom<IGetBtcTransactionsResponse>(
      this.httpService.get(`https://btcscan.org/api/tx/${hash}`).pipe(
        map((response) => response.data),
        catchError(async (error) => {
          this.logger.error(`${errorMsgs.btsScan}
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
        }),
      ),
    );
  }
}

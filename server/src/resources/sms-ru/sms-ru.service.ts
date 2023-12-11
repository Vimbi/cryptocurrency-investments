import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { SMSRuCodeCallOptions } from '../../types/sms-ru/SMSRuCodeCallOptions.interface';
import { SMSRuCodeCallResponse } from '../../types/sms-ru/SMSRuCodeCallResponse.interface';
import { SMSRuError } from '../../types/sms-ru/SMSRuError.error';
import { SMSRuGetBalanceResponse } from '../../types/sms-ru/SMSRuGetBalanceResponse.interface';
import { SMSRuGetCostOptions } from '../../types/sms-ru/SMSRuGetCostOptions.interface';
import { SMSRuGetCostResponse } from '../../types/sms-ru/SMSRuGetCostResponse.interface';
import { SMSRuGetFreeResponse } from '../../types/sms-ru/SMSRuGetFreeResponse.interface';
import { SMSRuGetLimitResponse } from '../../types/sms-ru/SMSRuGetLimitResponse.interface';
import { SMSRuGetSendersResponse } from '../../types/sms-ru/SMSRuGetSendersResponse.interface';
import { SMSRuParams } from '../../types/sms-ru/SMSRuParams.interface';
import { SMSRuSMSStatuses } from '../../types/sms-ru/SMSRuSMSStatuses.interface';
import { SMSRuSendSMSOptions } from '../../types/sms-ru/SMSRuSendSMSOptions.interface';
import { SMSRuSendSMSResponse } from '../../types/sms-ru/SMSRuSendSMSResponse.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class SMSRuService {
  private _params: SMSRuParams;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private logger: Logger,
  ) {
    this._params = {
      baseUrl: this.configService.get('smsru.baseUrl'),
      api_id: this.configService.get('smsru.apiId'),
    };
  }

  /**
   * Отправить СМС сообщение
   *
   * Если у вас есть необходимость в отправке СМС
   * сообщения из вашей программы, то вы можете
   * использовать этот метод.
   *
   * @see http://sms.ru/api/send
   */
  async sendSms(options: SMSRuSendSMSOptions): Promise<SMSRuSendSMSResponse> {
    const params = {
      ...options,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      time: !options.time
        ? undefined
        : options.time instanceof Date
        ? options.time.valueOf()
        : typeof options.time === 'string'
        ? new Date(options.time).valueOf()
        : options.time,
      daytime: options.daytime ? 1 : options.daytime === false ? 0 : undefined,
      transit: options.transit ? 1 : options.transit === false ? 0 : undefined,
      test: options.test ? 1 : options.test === false ? 0 : undefined,
    };

    const sendResponse = await this._makeApiRequest<SMSRuSendSMSResponse>(
      'sms/send',
      params,
    );
    if (typeof options.to === 'string') {
      if (sendResponse.sms[options.to].status === 'ERROR') {
        this.logger.error(JSON.stringify(sendResponse));
        // throw new BadRequestException(errorMsgs.smsRuError);
      }
    }

    return sendResponse;
  }

  /**
   * Отправить четырехзначный авторизационный код звонком
   *
   * @see https://sms.ru/api/code_call
   */
  async codeCall(
    options: SMSRuCodeCallOptions,
  ): Promise<SMSRuCodeCallResponse> {
    const params = { phone: options.to };
    return this._makeApiRequest<SMSRuCodeCallResponse>('code/call', params);
  }

  /**
   * Проверить статус отправленных сообщений
   *
   * Если у вас есть необходимость вручную проверить
   * статус отправленных вами сообщений, то вы
   * можете использовать этот метод.
   *
   * @see http://sms.ru/api/status
   */
  async checkSmsStatuses(smsIds: string | string[]): Promise<SMSRuSMSStatuses> {
    const smsStatuses = await this._makeApiRequest<SMSRuSMSStatuses>(
      'sms/status',
      {
        sms_id: Array.isArray(smsIds) ? smsIds.join(',') : smsIds,
      },
    );

    return smsStatuses;
  }

  /**
   * Проверить стоимость сообщений перед отправкой.
   *
   * Если у вас есть необходимость проверить стоимость сообщения
   * перед его отправкой из вашей программы,
   * то вы можете использовать этот метод.
   *
   * @see http://sms.ru/api/cost
   */
  async getCost(options: SMSRuGetCostOptions): Promise<SMSRuGetCostResponse> {
    const params = {
      ...options,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      transit: options.transit ? 1 : options.transit === false ? 0 : undefined,
    };

    return this._makeApiRequest<SMSRuGetCostResponse>('sms/cost', params);
  }

  /**
   * Получить информацию о балансе
   *
   * Если вы хотите узнать ваш текущий баланс на сайте SMS.RU,
   * используйте этот метод.
   */
  async getBalance(): Promise<number> {
    const getBalanceResponse =
      await this._makeApiRequest<SMSRuGetBalanceResponse>('my/balance');
    return getBalanceResponse.balance;
  }

  /**
   * Получить информацию о дневном лимите и его использовании
   *
   * Если вы хотите узнать какой у вас лимит на отправку
   * сообщений и на какое количество номеров вы уже
   * сегодня отправили сообщения, используйте этот метод.
   */
  async getLimit(): Promise<SMSRuGetLimitResponse> {
    return this._makeApiRequest<SMSRuGetLimitResponse>('my/limit');
  }

  /**
   * Получить информацию о бесплатных сообщениях и его
   * использовании.
   *
   * Если вы хотите узнать ваш расход бесплатных
   * сообщений на свой номер за день, используйте этот метод.
   */
  async getFree(): Promise<SMSRuGetFreeResponse> {
    return this._makeApiRequest<SMSRuGetFreeResponse>('my/free');
  }

  /**
   * Получение списка одобренных отправителей
   *
   * Если вы хотите получить список отправителей, которые
   * были согласованы вами на сайте SMS.RU,
   * то необходимо использовать этот метод
   */
  async getSenders(): Promise<string[]> {
    const getSendersResponse =
      await this._makeApiRequest<SMSRuGetSendersResponse>('my/senders');
    return getSendersResponse.senders;
  }

  /**
   * Проверить на валидность пару логин/пароль (или api_id).
   *
   * Если вы хотите проверить, является ли рабочим ваш api_id
   * или логин и пароль, используйте этот метод.
   *
   * Если вам api_id или логин и пароль работают - метод ничего не вернет,
   * иначе выбросит исключение.
   */
  async checkAuth(): Promise<void> {
    await this._makeApiRequest('auth/check');
  }

  private async _makeApiRequest<T = any>(
    path: string,
    params?: Record<string, any>,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService
        .request<T>({
          url: path,
          params: {
            ...(params || {}),
            api_id: this._params.api_id,
            json: 1,
          },
          baseURL: this._params.baseUrl,
        })
        .pipe(
          map((response) => {
            if ((response.data as any)?.status !== 'OK') {
              throw new SMSRuError(
                `${errorMsgs.smsRuError}: ${
                  (response.data as any)?.status_text || 'Unknown error'
                }`,
                response.data,
              );
            }
            return response.data;
          }),
          catchError(async (error) => {
            this.logger.error(
              `${errorMsgs.smsRuError}
              Message: ${error.message}.
              Stack trace: ${error.stack}`,
            );
            throw new InternalServerErrorException(errorMsgs.smsRuError);
          }),
        ),
    );

    return response;
  }
}

export {
  SMSRuSendSMSOptions,
  SMSRuSendSMSResponse,
  SMSRuSMSStatuses,
  SMSRuGetCostOptions,
  SMSRuGetCostResponse,
  SMSRuGetLimitResponse,
  SMSRuGetFreeResponse,
  SMSRuError,
};

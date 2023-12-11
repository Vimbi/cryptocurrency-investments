import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { ITelegramSendMessageResponse } from '../../../types/telegram-bot/telegram-send-message-response.interface';
import { ITelegramSendMessage } from '../../../types/telegram-bot/telegram-send-message.interface';
import { TelegramMethodName } from '../enums/telegram-method-name.enum';
import { TelegramMessageParseMode } from '../enums/telegram-message-parse-mode.enum';
import { ITelegramSetWebhook } from '../../../types/telegram-bot/telegram-set-webhook.interface';
import { errorMsgs } from '../../../shared/error-messages';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { PRODUCTION } from '../../../utils/constants/common-constants';

@Injectable()
export class TelegramBotApiService {
  private readonly _nodeEnv: string;
  private readonly _apiUrl: string;
  private readonly _backendDomain: string;
  private readonly _proxyHost: string;
  private readonly _proxyLogin: string;
  private readonly _proxyPassword: string;
  private readonly _proxyPort: number;
  private readonly _proxyProtocol: string;
  private readonly _token: string;
  private readonly _webhookToken: string;
  private readonly _agent: HttpsProxyAgent<string>;
  private readonly _freeAgent: HttpsProxyAgent<string>;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {
    this._token = this.configService.get('telegramBot.token');
    this._apiUrl = `${this.configService.get('telegramBot.apiUrl')}${
      this._token
    }/`;
    this._backendDomain = this.configService.get('app.backendDomain');
    this._webhookToken = this.configService.get('telegramBot.webhookToken');
    this._proxyHost = this.configService.get('telegramBot.proxyHost');
    this._proxyPort = this.configService.get('telegramBot.proxyPort');
    this._proxyProtocol = this.configService.get('telegramBot.proxyProtocol');
    this._proxyLogin = this.configService.get('telegramBot.proxyLogin');
    this._proxyPassword = this.configService.get('telegramBot.proxyPassword');
    this._nodeEnv = this.configService.get('app.nodeEnv');
    this._agent = new HttpsProxyAgent(
      `${this._proxyProtocol}://${this._proxyLogin}:${this._proxyPassword}@${this._proxyHost}:${this._proxyPort}`,
    );
    this._freeAgent = new HttpsProxyAgent(
      `${this._proxyProtocol}://${this._proxyHost}:${this._proxyPort}`,
    );
  }

  /**
   * Makes a GET request
   * @param methodName telegram method name
   * @returns result
   */

  private async _getRequest(methodName: string) {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (this._nodeEnv === PRODUCTION) {
      config.proxy = false;
      config.httpsAgent =
        this._proxyLogin && this._proxyPassword ? this._agent : this._freeAgent;
    }

    return await firstValueFrom(
      this.httpService.get(`${this._apiUrl}${methodName}`, config).pipe(
        map((response) => response.data),
        catchError(async (error) => {
          this.logger.error(`Telegram bot api GET request error
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
          throw new BadRequestException(error);
        }),
      ),
    );
  }

  /**
   * Makes a POST request
   * @param methodName telegram method name
   * @param body post body
   * @returns result
   */

  private async _postRequest(
    methodName: TelegramMethodName,
    body: ITelegramSendMessage | ITelegramSetWebhook,
  ) {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (this._nodeEnv === PRODUCTION) {
      config.proxy = false;
      config.httpsAgent =
        this._proxyLogin && this._proxyPassword ? this._agent : this._freeAgent;
    }
    this.logger.log(`Telegram post request
      Body: ${JSON.stringify(body)}`);
    return await firstValueFrom(
      this.httpService.post(`${this._apiUrl}${methodName}`, body, config).pipe(
        map((response) => response.data),
        catchError(async (error) => {
          this.logger.error(`Telegram bot api POST request error
            Message: ${error.message}
            Stack: ${error.stack}
            Data: ${JSON.stringify(error?.response?.data)}`);
          throw new InternalServerErrorException(error);
        }),
      ),
    );
  }

  /**
   * Send message to the channel
   * @param text message
   * @returns result
   */

  async sendMessage({
    text,
    chat_id,
    parse_mode,
  }: ITelegramSendMessage): Promise<ITelegramSendMessageResponse> {
    return await this._postRequest(TelegramMethodName.sendMessage, {
      chat_id,
      text,
      parse_mode: parse_mode || TelegramMessageParseMode.HTML,
    });
  }

  /**
   * Set webhook
   */

  public async setWebhook() {
    if (!this._backendDomain || !this._webhookToken) {
      throw new InternalServerErrorException(errorMsgs.telegramWebhookOptions);
    }
    return await this._postRequest(TelegramMethodName.setWebhook, {
      url: `${this._backendDomain}/telegram-bot/webhook`,
      secret_token: this._webhookToken,
    });
  }

  /**
   * Get webhook info
   * @returns webhook info
   */

  public async getWebhookInfo() {
    return await this._getRequest(TelegramMethodName.getWebhookInfo);
  }
}

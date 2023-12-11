import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import fileConfig from './config/file.config';
import forgotConfig from './config/forgot.config';
import mailConfig from './config/mail.config';
import smsruConfig from './config/smsru.config';
import authConfig from './config/auth.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './resources/mail/mail.module';
import { MailConfigService } from './resources/mail/mail-config.service';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { RolesModule } from './resources/roles/roles.module';
import { UserStatusesModule } from './resources/user-statuses/user-statuses.module';
import { ForgotModule } from './resources/forgot/forgot.module';
import { UsersModule } from './resources/users/users.module';
import { IsNotExist } from './validation/is-not-exists.validator';
import { IsExist } from './validation/is-exists.validator';
import { SMSRUModule } from './resources/sms-ru/sms-ru.module';
import { IsUserNotExist } from './validation/is-user-not-exists.validator';
import { AuthModule } from './resources/auth/auth.module';
import { IsUserNotDeleted } from './validation/is-user-not-deleted.validator';
import referralProgramConfig from './config/referral-program.config';
import { ProductsModule } from './resources/products/products.module';
import { BinanceModule } from './resources/binance/binance.module';
import binanceConfig from './config/binance.config';
import { CurrenciesModule } from './resources/currencies/currencies.module';
import { NetworksModule } from './resources/networks/networks.module';
import { TransferStatusesModule } from './resources/transfer-statuses/transfer-statuses.module';
import { TransfersModule } from './resources/transfers/transfers.module';
import transferConfig from './config/transfer.config';
import { TransactionTypesModule } from './resources/transaction-types/transaction-types.module';
import { TransactionsModule } from './resources/transactions/transactions.module';
import fixedCurrencyRateConfig from './config/fixed-currency-rate.config';
import { FixedCurrencyRatesModule } from './resources/fixed-currency-rates/fixed-currency-rates.module';
import { TransferTypesModule } from './resources/transfer-types/transfer-types.module';
import { IsPhoneNumber } from './validation/is-phone-number.validator';
import { AccountStatementsModule } from './resources/account-statements/account-statements.module';
import { ReferralLevelsModule } from './resources/referral-levels/referral-levels.module';
import { ProductEarningsSettingsModule } from './resources/product-earnings-settings/product-earnings-settings.module';
import investmentsConfig from './config/investments.config';
import { InvestmentsModule } from './resources/investments/investments.module';
import { InvestmentsTransactionsModule } from './resources/investments-transactions/investments-transactions.module';
import { ArticleTypesModule } from './resources/article-types/article-types.module';
import { ArticleModule } from './resources/articles/articles.module';
import { UserWalletsModule } from './resources/user-wallets/user-wallets.module';
import userWalletsConfig from './config/user-wallets.config';
import { IsUserPhoneNumber } from './validation/is-user-phone-number.validator';
import { OfficeOpeningRequestsModule } from './resources/office-opening-requests/office-opening-requests.module';
import { YandexCloudModule } from './resources/yandex-cloud/yandex-cloud.module';
import { ArticleFilesModule } from './resources/article-files/article-files.module';
import { FilesModule } from './resources/files/files.module';
import telegramBotConfig from './config/telegram-bot.config';
import { TelegramBotModule } from './resources/telegram-bot/telegram-bot.module';
import { EventsModule } from './resources/events/events.module';
import { RaffleFilesModule } from './resources/raffle-files/raffle-files.module';
import { RafflesModule } from './resources/raffles/raffles.module';
import throttlerConfig from './config/throttler.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from './throttler/throttler-config.service';
import { APP_GUARD } from '@nestjs/core';
import { LocalesModule } from './resources/locales/locales.module';
import accountStatementConfig from './config/account-statement.config';
import { ArticleTypeLocaleContentModule } from './resources/article-type-locale-content/article-type-locale-content.module';
import { RafflesLocaleContentModule } from './resources/raffles-local-content/raffles-locale-content.module';
import { ProductsLocaleContentModule } from './resources/products-locale-content/products-locale-content.module';
import { TransactionTypesLocaleContentModule } from './resources/transaction-types-locale-content/transaction-type-locale-content.module';
import { TransferTypesLocaleContentModule } from './resources/transfer-types-locale-content/transfer-types-locale-content.module';
import { TransferStatusesLocaleContentModule } from './resources/transfer-statuses-locale-content/transfer-statuses-locale-content.module';
import { TransferCodesModule } from './resources/transfers-codes/transfer-codes.module';
import { RecaptchaModule } from './resources/recaptcha/recaptcha.module';
import { TransactionCodesModule } from './resources/transactions-codes/transaction-codes.module';
import transactionConfig from './config/transaction.config';
import tronscanConfig from './config/tronscan.config';
import { TronscanModule } from './resources/tronscan/tronscan.module';
import { BullModule } from '@nestjs/bull';
import { BullConfigService } from './resources/bull/bull-config.service';
import bullConfig from './config/bull.config';
import { TransferInfoModule } from './resources/transfer-info/transfer-info.module';
import bscscanConfig from './config/bscscan.config';
import { BscscanModule } from './resources/bscscan/bscscan.module';
import etherScanConfig from './config/ether-scan.config';
import { EtherScanModule } from './resources/ether-scan/ether-scan.module';
import { BtcScanModule } from './resources/btc-scan/btc-scan.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        accountStatementConfig,
        appConfig,
        authConfig,
        binanceConfig,
        bscscanConfig,
        bullConfig,
        databaseConfig,
        etherScanConfig,
        fileConfig,
        fixedCurrencyRateConfig,
        forgotConfig,
        investmentsConfig,
        mailConfig,
        referralProgramConfig,
        smsruConfig,
        throttlerConfig,
        transactionConfig,
        transferConfig,
        tronscanConfig,
        telegramBotConfig,
        userWalletsConfig,
      ],
    }),
    EventEmitterModule.forRoot(),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AccountStatementsModule,
    ArticleFilesModule,
    ArticleModule,
    ArticleTypeLocaleContentModule,
    ArticleTypesModule,
    AuthModule,
    BinanceModule,
    BscscanModule,
    BtcScanModule,
    CurrenciesModule,
    EtherScanModule,
    EventsModule,
    FilesModule,
    FixedCurrencyRatesModule,
    ForgotModule,
    InvestmentsModule,
    InvestmentsTransactionsModule,
    LocalesModule,
    MailModule,
    NetworksModule,
    OfficeOpeningRequestsModule,
    ProductsLocaleContentModule,
    ProductsModule,
    ProductEarningsSettingsModule,
    RafflesModule,
    RaffleFilesModule,
    RafflesLocaleContentModule,
    ReferralLevelsModule,
    RecaptchaModule,
    RolesModule,
    ScheduleModule.forRoot(),
    SMSRUModule,
    TelegramBotModule,
    TransferCodesModule,
    TransactionsModule,
    TransactionCodesModule,
    TransactionTypesLocaleContentModule,
    TransactionTypesModule,
    TransferInfoModule,
    TransfersModule,
    TransferStatusesLocaleContentModule,
    TransferStatusesModule,
    TransferTypesLocaleContentModule,
    TransferTypesModule,
    TronscanModule,
    UsersModule,
    UserStatusesModule,
    UserWalletsModule,
    YandexCloudModule,
  ],
  controllers: [],
  providers: [
    IsNotExist,
    IsExist,
    IsUserNotExist,
    IsUserNotDeleted,
    Logger,
    IsPhoneNumber,
    IsUserPhoneNumber,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {}

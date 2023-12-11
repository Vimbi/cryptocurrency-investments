import { MigrationInterface, QueryRunner } from 'typeorm';
import { Role } from '../../resources/roles/entities/role.entity';
import { RoleEnum } from '../../resources/roles/roles.enum';
import { UserStatus } from '../../resources/user-statuses/entities/user-status.entity';
import { UserStatusEnum } from '../../resources/user-statuses/user-status.enum';
import { User } from '../../resources/users/entities/user.entity';
import {
  AVERAGE_LENGTH,
  LARGE_LENGTH,
  LONG_LENGTH,
  MAX_DECIMAL_PLACES_CURRENCY,
  MAX_NUMBER_DIGITS_CURRENCY,
  SHORT_LENGTH,
} from '../../utils/constants/common-constants';
import { encryptPassword } from '../../utils/encrypt-password';
import { TransferType } from '../../resources/transfer-types/entities/transfer-type.entity';
import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';
import { Currency } from '../../resources/currencies/entities/currency.entity';
import { CurrenciesSymbolsEnum } from '../../resources/currencies/currencies-symbols.enum';
import { Product } from '../../resources/products/entities/product.entity';
import { TransferStatus } from '../../resources/transfer-statuses/entities/transfer-status.entity';
import { TransferStatusEnum } from '../../resources/transfer-statuses/transfer-status.enum';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';
import { TransactionType } from '../../resources/transaction-types/entities/transaction-type.entity';
import { ArticleTypeEnum } from '../../resources/article-types/article-type.enum';
import { ArticleType } from '../../resources/article-types/entities/article-type.entity';

export class Initial1687878409714 implements MigrationInterface {
  name = 'initial1687878409714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        CONSTRAINT "PK_role" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_role_name" UNIQUE ("name")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "userStatus"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        CONSTRAINT "PK_userStatus" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_userStatus_name" UNIQUE ("name")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "product"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "price" integer NOT NULL,
        "earnings" character varying(${SHORT_LENGTH}) NOT NULL,
        "features" character varying(${AVERAGE_LENGTH})[],
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_product" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_displayName" UNIQUE ("displayName")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "parentId" uuid,
        "phone" character varying(${SHORT_LENGTH}) NOT NULL,
        "email" character varying(${SHORT_LENGTH}),
        "isEmailConfirmed" boolean NOT NULL DEFAULT false,
        "password" character varying(${LONG_LENGTH}) NOT NULL,
        "firstName" character varying(${SHORT_LENGTH}) NOT NULL,
        "lastName" character varying(${SHORT_LENGTH}) NOT NULL,
        "surname" character varying(${SHORT_LENGTH}),
        "code" character varying(${SHORT_LENGTH}),
        "codeSendedAt" TIMESTAMP WITH TIME ZONE,
        "hash" character varying,
        "referralCode" character varying(${SHORT_LENGTH}) NOT NULL,
        "refreshToken" character varying(${AVERAGE_LENGTH}),
        "roleId" uuid,
        "statusId" uuid,
        "telegramChatId" bigint,
        "isTwoFactorAuthenticationEnabled" boolean DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_phone" UNIQUE ("phone"),
        CONSTRAINT "UQ_user_referralCode" UNIQUE ("referralCode"),
        CONSTRAINT "FK_user_roleId" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_user_statusId" FOREIGN KEY ("statusId") REFERENCES "userStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "forgot"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE,
        "userId" uuid,
        CONSTRAINT "PK_forgot" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "currency"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "symbol" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_currency" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_currency_displayName" UNIQUE ("displayName"),
        CONSTRAINT "UQ_currency_symbol" UNIQUE ("symbol")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "referralLevel"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "level" integer NOT NULL,
        "percentage" integer NOT NULL,
        "status" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_referralLevel" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_referralLevel_level" UNIQUE ("level"),
        CONSTRAINT "CHK_referralLevel_level" CHECK ("level" >= 1 OR "level" <= 10),
        CONSTRAINT "CHK_referralLevel_percentage" CHECK ("percentage" > 0 AND "percentage" < 10000)
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "network"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "currencyId" uuid NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "description" character varying(${SHORT_LENGTH}) NOT NULL,
        "depositAddress" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_network" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_network_currencyId" UNIQUE ("currencyId"),
        CONSTRAINT "UQ_network_displayName" UNIQUE ("displayName"),
        CONSTRAINT "UQ_network_depositAddress" UNIQUE ("depositAddress"),
        CONSTRAINT "FK_network_currencyId" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "transferStatus"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transferStatus" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_transferStatus_name" UNIQUE ("name"),
        CONSTRAINT "UQ_transferStatus_displayName" UNIQUE ("displayName")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "transferType"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        CONSTRAINT "PK_transferType" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_transferType_name" UNIQUE ("name"),
        CONSTRAINT "UQ_transferType_displayName" UNIQUE ("displayName")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactionType"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transactionType" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_transactionType_name" UNIQUE ("name"),
        CONSTRAINT "UQ_transactionType_displayName" UNIQUE ("displayName")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfer"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "currencyId" uuid NOT NULL,
        "currencyAmount" decimal(${MAX_NUMBER_DIGITS_CURRENCY}, ${MAX_DECIMAL_PLACES_CURRENCY}) NOT NULL,
        "amount" integer NOT NULL,
        "typeId" uuid NOT NULL,
        "statusId" uuid NOT NULL,
        "txId" character varying(${SHORT_LENGTH}),
        "withdrawalAddress" character varying(${SHORT_LENGTH}),
        "note" character varying(${SHORT_LENGTH}),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        "endedAt" TIMESTAMP WITH TIME ZONE,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transfer" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transfer_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transfer_currencyId" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transfer_statusId" FOREIGN KEY ("statusId") REFERENCES "transferStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transfer_typeId" FOREIGN KEY ("typeId") REFERENCES "transferType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "investment"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "startDate" DATE NOT NULL,
        "dueDate" DATE NOT NULL,
        "amount" integer NOT NULL,
        "income" integer NOT NULL DEFAULT 0,
        "fine" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "canceledAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_investment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_investment_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_investment_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "productEarningsSetting"
      (
        "date" date NOT NULL,
        "productId" uuid NOT NULL,
        "percentage" integer NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_productEarningsSetting" PRIMARY KEY ("productId", "date"),
        CONSTRAINT "FK_productEarningsSetting_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "CHK_productEarningsSetting_percentage" CHECK ("percentage" > 0)
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "investmentTransaction"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "investmentId" uuid NOT NULL,
        "amount" integer NOT NULL,
        "typeId" uuid NOT NULL,
        "productEarningsSettingDate" DATE,
        "productEarningsSettingProductId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_investmentTransaction" PRIMARY KEY ("id"),
        CONSTRAINT "FK_investmentTransaction_investmentId" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_investmentTransaction_typeId" FOREIGN KEY ("typeId") REFERENCES "transactionType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_investmentTransaction_productEarningsSetting" FOREIGN KEY ("productEarningsSettingDate", "productEarningsSettingProductId") REFERENCES "productEarningsSetting"("date", "productId") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "amount" integer NOT NULL,
        "typeId" uuid NOT NULL,
        "transferId" uuid,
        "investmentId" uuid,
        "investmentTransactionId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transaction_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transaction_typeId" FOREIGN KEY ("typeId") REFERENCES "transactionType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transaction_transferId" FOREIGN KEY ("transferId") REFERENCES "transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transaction_investmentId" FOREIGN KEY ("investmentId") REFERENCES "investment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transaction_investmentTransactionId" FOREIGN KEY ("investmentTransactionId") REFERENCES "investmentTransaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "fixedCurrencyRate"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "currencyId" uuid NOT NULL,
        "rate" decimal(${MAX_NUMBER_DIGITS_CURRENCY}, ${MAX_DECIMAL_PLACES_CURRENCY}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "endedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_fixedCurrencyRate" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fixedCurrencyRate_currencyId" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "accountStatement"
      (
        "userId" uuid NOT NULL,
        "date" date NOT NULL,
        "closingBalance" integer NOT NULL,
        "totalIncome" integer NOT NULL,
        "totalConsumption" integer NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accountStatement" PRIMARY KEY ("userId", "date"),
        CONSTRAINT "FK_accountStatement_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "UQ_accountStatement_userId_date" UNIQUE ("userId", "date")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "articleType"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_articleType" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articleType_name" UNIQUE ("name"),
        CONSTRAINT "UQ_articleType_displayName" UNIQUE ("displayName")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "article"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "text" character varying(${LARGE_LENGTH}) NOT NULL,
        "videoLink" character varying(${LONG_LENGTH}),
        "isPublished" boolean NOT NULL DEFAULT false,
        "typeId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_article" PRIMARY KEY ("id"),
        CONSTRAINT "FK_article_typeId" FOREIGN KEY ("typeId") REFERENCES "articleType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "raffle"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "description" character varying(${LARGE_LENGTH}) NOT NULL,
        "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "isPublished" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_raffle" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "userWallet"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "currencyId" uuid NOT NULL,
        "address" character varying(${SHORT_LENGTH}) NOT NULL,
        "note" character varying(${SHORT_LENGTH}),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_userWallet" PRIMARY KEY ("id"),
        CONSTRAINT "FK_userWallet_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_userWallet_currencyId" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "officeOpeningRequest"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "phone" character varying(${SHORT_LENGTH}) NOT NULL,
        "email" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "name" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "surname" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "note" character varying(${LONG_LENGTH}),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "notifiedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_officeOpeningRequest" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_officeOpeningRequest_phone" UNIQUE ("phone"),
        CONSTRAINT "UQ_officeOpeningRequest_email" UNIQUE ("email")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "file"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "path" character varying(${LONG_LENGTH}) NOT NULL,
        "name" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "extension" character varying(${SHORT_LENGTH}) NOT NULL,
        "key" character varying(${LONG_LENGTH}) NOT NULL,
        "theme" character varying(${SHORT_LENGTH}),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "articleFile"
      (
        "articleId" uuid NOT NULL,
        "fileId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_articleFile" PRIMARY KEY ("articleId", "fileId"),
        CONSTRAINT "FK_articleFile_articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_articleFile_fileId" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "UQ_articleFile_articleId_fileId" UNIQUE ("articleId", "fileId")
        )`,
    );
    await queryRunner.query(
      `CREATE TABLE "raffleFile"
      (
        "raffleId" uuid NOT NULL,
        "fileId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_raffleFile" PRIMARY KEY ("raffleId", "fileId"),
        CONSTRAINT "FK_raffleFile_raffleId" FOREIGN KEY ("raffleId") REFERENCES "raffle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_raffleFile_fileId" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "UQ_raffleFile_raffleId_fileId" UNIQUE ("raffleId", "fileId")
        )`,
    );

    await queryRunner.manager.insert(TransferType, {
      name: TransferTypeEnum.deposit,
      displayName: TransferTypeEnum.deposit,
    });

    await queryRunner.manager.insert(TransferType, {
      name: TransferTypeEnum.withdrawal,
      displayName: TransferTypeEnum.withdrawal,
    });

    await queryRunner.manager.insert(Role, {
      name: RoleEnum.admin,
      displayName: 'Admin',
    });
    await queryRunner.manager.insert(Role, {
      name: RoleEnum.superAdmin,
      displayName: 'Super admin',
    });
    await queryRunner.manager.insert(Role, {
      name: RoleEnum.user,
      displayName: 'User',
    });
    await queryRunner.manager.insert(UserStatus, {
      name: UserStatusEnum.active,
      displayName: UserStatusEnum.active,
    });
    await queryRunner.manager.insert(UserStatus, {
      name: UserStatusEnum.inactive,
      displayName: UserStatusEnum.inactive,
    });

    await queryRunner.manager.insert(Currency, {
      symbol: CurrenciesSymbolsEnum.USDT,
      displayName: 'Tether',
    });

    await queryRunner.manager.insert(Currency, {
      symbol: 'ETH',
      displayName: 'Ethereum',
    });

    await queryRunner.manager.insert(Currency, {
      symbol: 'BNB',
      displayName: 'BNB',
    });

    await queryRunner.manager.insert(Currency, {
      symbol: 'BTC',
      displayName: 'Bitcoin',
    });

    await queryRunner.manager.insert(Product, {
      displayName: 'Standart',
      price: 10000,
      // features: [
      //   'Процент начисления <b>0,7% в день</b>',
      //   'Срок вклада <b>3 месяца</b>',
      //   'Начисление процентов - <b>ежедневное</b>',
      //   '<b>Открыть вклад можно неограниченное количество раз</b>',
      // ],
    });
    await queryRunner.manager.insert(Product, {
      displayName: 'Gold',
      price: 50000,
      // features: [
      //   'Процент начисления <b>0,8% в день</b>',
      //   'Срок вклада <b>3 месяца</b>',
      //   'Начисление процентов - <b>ежедневное</b>',
      //   '<b>Открыть вклад можно неограниченное количество раз</b>',
      // ],
    });
    await queryRunner.manager.insert(Product, {
      displayName: 'Vip',
      price: 100000,
      // features: [
      //   'Процент начисления <b>0,85% в день</b>',
      //   'Срок вклада <b>3 месяца</b>',
      //   'Начисление процентов - <b>ежедневное</b>',
      //   '<b>Открыть вклад можно неограниченное количество раз</b>',
      // ],
    });

    const transferStatuses = Object.values(TransferStatusEnum);
    for (const transferStatus of transferStatuses) {
      await queryRunner.manager.insert(TransferStatus, {
        displayName: transferStatus,
        name: transferStatus,
      });
    }

    const transactionTypes = Object.values(TransactionTypeEnum);
    for (const transactionType of transactionTypes) {
      await queryRunner.manager.insert(TransactionType, {
        // displayName: transactionType,
        name: transactionType,
      });
    }

    const articleTypes = Object.values(ArticleTypeEnum);
    for (const articleType of articleTypes) {
      await queryRunner.manager.insert(ArticleType, {
        // displayName: articleType,
        name: articleType,
      });
    }

    const superAdminRole = await queryRunner.manager.findOneBy(Role, {
      name: RoleEnum.superAdmin,
    });
    const userStatusActive = await queryRunner.manager.findOneBy(UserStatus, {
      name: UserStatusEnum.active,
    });
    await queryRunner.manager.insert(User, {
      phone: '9999999999', // TODO изменить
      firstName: 'super-admin',
      lastName: 'super-admin',
      surname: 'super-admin',
      password: await encryptPassword('Ovva@2024'),
      role: superAdminRole,
      status: userStatusActive,
      referralCode: '999999999', // TODO изменить
    });

    await queryRunner.manager.insert(User, {
      phone: 'test1@example.com', // TODO изменить
      firstName: 'test',
      lastName: 'test',
      surname: 'test',
      password: await encryptPassword('32198723'),
      role: superAdminRole,
      status: userStatusActive,
      referralCode: '111111111', // TODO изменить
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "raffleFile" DROP CONSTRAINT "FK_raffleFile_raffleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile" DROP CONSTRAINT "FK_raffleFile_fileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile" DROP CONSTRAINT "FK_articleFile_articleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile" DROP CONSTRAINT "FK_articleFile_fileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet" DROP CONSTRAINT "FK_userWallet_currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet" DROP CONSTRAINT "FK_userWallet_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_article_typeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productEarningsSetting" DROP CONSTRAINT "FK_productEarningsSetting_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accountStatement" DROP CONSTRAINT "FK_accountStatement_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fixedCurrencyRate" DROP CONSTRAINT "FK_fixedCurrencyRate_currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_investmentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_investmentTransactionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_typeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investmentTransaction" DROP CONSTRAINT "FK_investmentTransaction_investmentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investmentTransaction" DROP CONSTRAINT "FK_investmentTransaction_typeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investmentTransaction" DROP CONSTRAINT "FK_investmentTransaction_productEarningsSetting"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investment" DROP CONSTRAINT "FK_investment_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "investment" DROP CONSTRAINT "FK_investment_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_transfer_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_transfer_currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_transfer_statusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_transfer_typeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_transferId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_statusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_network_currencyId"`,
    );
    await queryRunner.query(`DROP TABLE "raffleFile"`);
    await queryRunner.query(`DROP TABLE "articleFile"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "officeOpeningRequest"`);
    await queryRunner.query(`DROP TABLE "userWallet"`);
    await queryRunner.query(`DROP TABLE "raffle"`);
    await queryRunner.query(`DROP TABLE "article"`);
    await queryRunner.query(`DROP TABLE "articleType"`);
    await queryRunner.query(`DROP TABLE "productEarningsSetting"`);
    await queryRunner.query(`DROP TABLE "accountStatement"`);
    await queryRunner.query(`DROP TABLE "fixedCurrencyRate"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "investmentTransaction"`);
    await queryRunner.query(`DROP TABLE "investment"`);
    await queryRunner.query(`DROP TABLE "transfer"`);
    await queryRunner.query(`DROP TABLE "transactionType"`);
    await queryRunner.query(`DROP TABLE "transferType"`);
    await queryRunner.query(`DROP TABLE "transferStatus"`);
    await queryRunner.query(`DROP TABLE "network"`);
    await queryRunner.query(`DROP TABLE "referralLevel"`);
    await queryRunner.query(`DROP TABLE "currency"`);
    await queryRunner.query(`DROP TABLE "forgot"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "userStatus"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}

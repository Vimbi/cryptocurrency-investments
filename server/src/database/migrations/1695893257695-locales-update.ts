import { IsNull, MigrationInterface, Not, QueryRunner } from 'typeorm';
import {
  AVERAGE_LENGTH,
  LARGE_LENGTH,
  LONG_LENGTH,
  SHORT_LENGTH,
} from '../../utils/constants/common-constants';
import { Locale } from '../../resources/locales/entities/locale.entity';
import { Article } from '../../resources/articles/entities/article.entity';
import { LocaleEnum } from '../../resources/locales/locale.enum';
import { ArticleType } from '../../resources/article-types/entities/article-type.entity';
import { ArticleTypeEnum } from '../../resources/article-types/article-type.enum';
import { ArticleTypeLocaleContent } from '../../resources/article-type-locale-content/entities/article-type-locale-content.entity';
import { ArticleLocaleContent } from '../../resources/article-locale-content/entities/article-locale-content.entity';
import { Product } from '../../resources/products/entities/product.entity';
import { ProductLocaleContent } from '../../resources/products-locale-content/entities/product-locale-content.entity';
import { TransactionType } from '../../resources/transaction-types/entities/transaction-type.entity';
import { TransactionTypeLocaleContent } from '../../resources/transaction-types-locale-content/entities/transaction-type-locale-content.entity';
import { TransactionTypeEnum } from '../../resources/transaction-types/transaction-type.enum';
import { TransactionTypesRu } from '../../resources/transaction-types/transaction-types';
import { TransferType } from '../../resources/transfer-types/entities/transfer-type.entity';
import { TransferTypeLocaleContent } from '../../resources/transfer-types-locale-content/entities/transfer-type-locale-content.entity';
import { TransferStatus } from '../../resources/transfer-statuses/entities/transfer-status.entity';
import { TransferStatusLocaleContent } from '../../resources/transfer-statuses-locale-content/entities/transfer-statuses-locale-content.entity';
import { TransferStatusesRu } from '../../resources/transfer-statuses/transfer-statuses.ru';
import { TransferStatusEnum } from '../../resources/transfer-statuses/transfer-status.enum';
import { capitalizeFLetter } from '../../utils/capitalize-first-letter';
import { ThemeEnum } from '../../resources/files/theme.enum';

export class LocalesUpdate1695893257695 implements MigrationInterface {
  name = 'localesUpdate1695893257695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file"
      DROP COLUMN "theme"`,
    );
    const insertResultEnglish = await queryRunner.manager.insert(Locale, {
      name: LocaleEnum.en,
      displayName: 'English',
    });
    const enId = insertResultEnglish.identifiers[0].id;
    const { id: ruId } = await queryRunner.manager.findOneByOrFail(Locale, {
      name: LocaleEnum.ru,
    });
    await queryRunner.query(
      `ALTER TABLE "articleType"
      DROP COLUMN "displayName"`,
    );
    await queryRunner.query(
      `CREATE TABLE "articleTypeLocaleContent"
      (
        "typeId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_articleTypeLocaleContent" PRIMARY KEY ("typeId", "localeId"),
        CONSTRAINT "UQ_articleTypeLocaleContent_typeId_localeId" UNIQUE ("typeId", "localeId"),
        CONSTRAINT "FK_articleTypeLocaleContent_typeId" FOREIGN KEY ("typeId") REFERENCES "articleType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_articleTypeLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const academy = await queryRunner.manager.findOneByOrFail(ArticleType, {
      name: ArticleTypeEnum.academy,
    });
    const news = await queryRunner.manager.findOneByOrFail(ArticleType, {
      name: ArticleTypeEnum.news,
    });
    await queryRunner.manager.insert(ArticleTypeLocaleContent, {
      typeId: academy.id,
      localeId: ruId,
      displayName: 'Академия',
    });
    await queryRunner.manager.insert(ArticleTypeLocaleContent, {
      typeId: academy.id,
      localeId: enId,
      displayName: 'Academy',
    });
    await queryRunner.manager.insert(ArticleTypeLocaleContent, {
      typeId: news.id,
      localeId: ruId,
      displayName: 'Новости',
    });
    await queryRunner.manager.insert(ArticleTypeLocaleContent, {
      typeId: news.id,
      localeId: enId,
      displayName: 'News',
    });

    await queryRunner.query(
      `ALTER TABLE "articleFile"
      ADD COLUMN "theme" character varying(${SHORT_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile"
      ADD CONSTRAINT "FK_articleFile_localeId" FOREIGN KEY ("localeId") REFERENCES "locale" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `UPDATE "articleFile" SET "localeId" = $1, "theme" = $2`,
      [ruId, ThemeEnum.light],
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      ADD COLUMN "theme" character varying(${SHORT_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `UPDATE "raffleFile" SET "localeId" = $1, "theme" = $2`,
      [ruId, ThemeEnum.light],
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile"
      ALTER COLUMN "localeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      ALTER COLUMN "localeId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      ADD CONSTRAINT "FK_raffleFile_localeId" FOREIGN KEY ("localeId") REFERENCES "locale" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "article"
      DROP CONSTRAINT "FK_article_localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      DROP COLUMN "localeId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP CONSTRAINT "FK_raffle_localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP COLUMN "localeId"`,
    );

    await queryRunner.query(
      `CREATE TABLE "articleLocaleContent"
      (
        "articleId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "title" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "text" character varying(${LARGE_LENGTH}) NOT NULL,
        "videoLink" character varying(${LONG_LENGTH}),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_articleLocaleContent" PRIMARY KEY ("articleId", "localeId"),
        CONSTRAINT "UQ_articleLocaleContent_articleId_localeId" UNIQUE ("articleId", "localeId"),
        CONSTRAINT "FK_articleLocaleContent_articleId" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_articleLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const articles = await queryRunner.manager.find(Article, {
      where: { id: Not(IsNull()) },
    });
    // for (const article of articles) {
    //   const { id, title, text, videoLink } = article;
    //   await queryRunner.manager.insert(ArticleLocaleContent, {
    //     articleId: id,
    //     localeId: ruId,
    //     title,
    //     text,
    //     videoLink,
    //   });
    // }
    // await queryRunner.query(
    //   `ALTER TABLE "article"
    //   DROP COLUMN "title"`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "article"
    //   DROP COLUMN "text"`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "article"
    //   DROP COLUMN "videoLink"`,
    // );

    await queryRunner.query(
      `CREATE TABLE "raffleLocaleContent"
      (
        "raffleId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "title" character varying(${AVERAGE_LENGTH}) NOT NULL,
        "description" character varying(${LARGE_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_raffleLocaleContent" PRIMARY KEY ("raffleId", "localeId"),
        CONSTRAINT "UQ_raffleLocaleContent_raffleId_localeId" UNIQUE ("raffleId", "localeId"),
        CONSTRAINT "FK_raffleLocaleContent_raffleId" FOREIGN KEY ("raffleId") REFERENCES "raffle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_raffleLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP COLUMN "title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP COLUMN "description"`,
    );

    await queryRunner.query(
      `CREATE TABLE "productLocaleContent"
      (
        "productId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "features" character varying(${AVERAGE_LENGTH})[],
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_productLocaleContent" PRIMARY KEY ("productId", "localeId"),
        CONSTRAINT "UQ_productLocaleContent_productId_localeId" UNIQUE ("productId", "localeId"),
        CONSTRAINT "FK_productLocaleContent_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_productLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const products = await queryRunner.manager.find(Product, {
      where: { id: Not(IsNull()) },
    });
    // for (const product of products) {
    //   const { id, features } = product;
    //   await queryRunner.manager.insert(ProductLocaleContent, {
    //     productId: id,
    //     localeId: ruId,
    //     features,
    //   });
    // }
    const standard = await queryRunner.manager.findOneOrFail(Product, {
      where: { id: '224a298a-d6da-4cbd-af5c-c929afe0ba52' },
    });
    await queryRunner.manager.insert(ProductLocaleContent, {
      productId: standard.id,
      localeId: enId,
      features: [
        'Accrual percentage **0.7% per day**',
        'Deposit term **3 months**',
        'Interest accrual - **daily**',
        '**You can open a deposit an unlimited number of times**',
      ],
    });
    const gold = await queryRunner.manager.findOneOrFail(Product, {
      where: { id: '3e703d09-bde6-45c9-9358-51c21478f57e' },
    });
    await queryRunner.manager.insert(ProductLocaleContent, {
      productId: gold.id,
      localeId: enId,
      features: [
        'Accrual percentage **0.8% per day**',
        'Deposit term **3 months**',
        'Interest accrual - **daily**',
        '**You can open a deposit an unlimited number of times**',
      ],
    });
    const vip = await queryRunner.manager.findOneOrFail(Product, {
      where: { id: '0fd24512-3457-43d1-83d9-35bbd464ea71' },
    });
    await queryRunner.manager.insert(ProductLocaleContent, {
      productId: vip.id,
      localeId: enId,
      features: [
        'Accrual percentage **0.85% per day**',
        'Deposit term **3 months**',
        'Interest accrual - **daily**',
        '**You can open a deposit an unlimited number of times**',
      ],
    });

    await queryRunner.query(
      `CREATE TABLE "transactionTypeLocaleContent"
      (
        "typeId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transactionTypeLocaleContent" PRIMARY KEY ("typeId", "localeId"),
        CONSTRAINT "UQ_transactionTypeLocaleContent_typeId_localeId" UNIQUE ("typeId", "localeId"),
        CONSTRAINT "FK_transactionTypeLocaleContent_typeId" FOREIGN KEY ("typeId") REFERENCES "transactionType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transactionTypeLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const transactionTypes = await queryRunner.manager.find(TransactionType, {
      where: { id: Not(IsNull()) },
    });
    for (const transactionType of transactionTypes) {
      const { id, name } = transactionType;
      await queryRunner.manager.insert(TransactionTypeLocaleContent, {
        typeId: id,
        localeId: ruId,
        displayName: TransactionTypesRu[name],
      });
      await queryRunner.manager.insert(TransactionTypeLocaleContent, {
        typeId: id,
        localeId: enId,
        displayName: capitalizeFLetter(TransactionTypeEnum[name]),
      });
    }

    await queryRunner.query(
      `CREATE TABLE "transferTypeLocaleContent"
      (
        "typeId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transferTypeLocaleContent" PRIMARY KEY ("typeId", "localeId"),
        CONSTRAINT "UQ_transferTypeLocaleContent_typeId_localeId" UNIQUE ("typeId", "localeId"),
        CONSTRAINT "FK_transferTypeLocaleContent_typeId" FOREIGN KEY ("typeId") REFERENCES "transferType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transferTypeLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const transferTypes = await queryRunner.manager.find(TransferType, {
      where: { id: Not(IsNull()) },
    });
    for (const transferType of transferTypes) {
      const { id, name } = transferType;
      await queryRunner.manager.insert(TransferTypeLocaleContent, {
        typeId: id,
        localeId: ruId,
        displayName: TransactionTypesRu[name],
      });
      await queryRunner.manager.insert(TransferTypeLocaleContent, {
        typeId: id,
        localeId: enId,
        displayName: capitalizeFLetter(TransactionTypeEnum[name]),
      });
    }
    await queryRunner.query(
      `CREATE TABLE "transferStatusLocaleContent"
      (
        "statusId" uuid NOT NULL,
        "localeId" uuid NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transferStatusLocaleContent" PRIMARY KEY ("statusId", "localeId"),
        CONSTRAINT "UQ_transferStatusLocaleContent_statusId_localeId" UNIQUE ("statusId", "localeId"),
        CONSTRAINT "FK_transferStatusLocaleContent_statusId" FOREIGN KEY ("statusId") REFERENCES "transferStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transferStatusLocaleContent_localeId" FOREIGN KEY ("localeId") REFERENCES "locale"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
    const transferStatuses = await queryRunner.manager.find(TransferStatus, {
      where: { id: Not(IsNull()) },
    });
    for (const transferStatus of transferStatuses) {
      const { id, name } = transferStatus;
      await queryRunner.manager.insert(TransferStatusLocaleContent, {
        statusId: id,
        localeId: ruId,
        displayName: TransferStatusesRu[name],
      });
      await queryRunner.manager.insert(TransferStatusLocaleContent, {
        statusId: id,
        localeId: enId,
        displayName: capitalizeFLetter(TransferStatusEnum[name]),
      });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transferStatusLocaleContent"`);
    await queryRunner.query(`DROP TABLE "transferTypeLocaleContent"`);
    await queryRunner.query(`DROP TABLE "transactionTypeLocaleContent"`);
    await queryRunner.query(`DROP TABLE "productLocaleContent"`);
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD COLUMN "title" character varying(${AVERAGE_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD COLUMN "description" character varying(${LARGE_LENGTH})`,
    );
    await queryRunner.query(`DROP TABLE "raffleLocaleContent"`);
    await queryRunner.query(
      `ALTER TABLE "article"
      ADD COLUMN "title" character varying(${AVERAGE_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      ADD COLUMN "text" character varying(${LARGE_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      ADD COLUMN "videoLink" character varying(${LONG_LENGTH})`,
    );
    await queryRunner.query(`DROP TABLE "articleLocaleContent"`);

    await queryRunner.query(
      `ALTER TABLE "articleFile"
      DROP COLUMN "theme"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile"
      DROP COLUMN "localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleFile"
      DROP CONSTRAINT "FK_articleFile_localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      DROP COLUMN "theme"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      DROP COLUMN "localeId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "raffleFile"
      DROP CONSTRAINT "FK_raffleFile_localeId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "article"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      ADD CONSTRAINT "FK_article_localeId" `,
    );

    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD CONSTRAINT "FK_raffle_localeId" FOREIGN KEY ("localeId") REFERENCES "locale" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "file"
      ADD COLUMN "theme" character varying(${SHORT_LENGTH})`,
    );
    await queryRunner.query(
      `ALTER TABLE "articleType"
      ADD COLUMN "displayName" character varying(${SHORT_LENGTH})`,
    );
    await queryRunner.query(`DROP TABLE "articleTypeLocaleContent"`);
  }
}

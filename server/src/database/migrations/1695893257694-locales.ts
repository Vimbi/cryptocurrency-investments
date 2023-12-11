import { IsNull, MigrationInterface, Not, QueryRunner } from 'typeorm';
import { SHORT_LENGTH } from '../../utils/constants/common-constants';
import { Locale } from '../../resources/locales/entities/locale.entity';
import { Article } from '../../resources/articles/entities/article.entity';
import { Raffle } from '../../resources/raffles/entities/raffle.entity';

export class Locales1695893257694 implements MigrationInterface {
  name = 'locales1695893257694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "locale"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(${SHORT_LENGTH}) NOT NULL,
        "displayName" character varying(${SHORT_LENGTH}) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_locale" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_locale_name" UNIQUE ("name"),
        CONSTRAINT "UQ_locale_displayName" UNIQUE ("displayName")
        )`,
    );
    const insertResult = await queryRunner.manager.insert(Locale, {
      name: 'ru',
      displayName: 'Русский язык',
    });
    const localeId = insertResult.identifiers[0].id;

    await queryRunner.query(
      `ALTER TABLE "article"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      ADD CONSTRAINT "FK_article_localeId" FOREIGN KEY ("localeId") REFERENCES "locale" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD COLUMN "localeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ADD CONSTRAINT "FK_raffle_localeId" FOREIGN KEY ("localeId") REFERENCES "locale" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    // await queryRunner.manager.update(
    //   Article,
    //   { id: Not(IsNull()) },
    //   { localeId },
    // );
    // await queryRunner.manager.update(
    //   Raffle,
    //   { id: Not(IsNull()) },
    //   { localeId },
    // );
    await queryRunner.query(
      `ALTER TABLE "article"
      ALTER COLUMN "localeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      ALTER COLUMN "localeId" SET NOT NULL`,
    );
    await queryRunner.query(`TRUNCATE  "userWallet"`);
    await queryRunner.query(
      `ALTER TABLE "userWallet" DROP CONSTRAINT "FK_userWallet_currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      DROP COLUMN "currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      ADD COLUMN "networkId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      ADD CONSTRAINT "FK_userWallet_networkId" FOREIGN KEY ("networkId") REFERENCES "network" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "userWallet" DROP CONSTRAINT "FK_userWallet_networkId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      DROP COLUMN "networkId"`,
    );
    await queryRunner.query(`TRUNCATE  "userWallet"`);
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      ADD COLUMN "currencyId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "userWallet"
      ADD CONSTRAINT "FK_userWallet_currencyId" FOREIGN KEY ("currencyId") REFERENCES "currency" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP CONSTRAINT "FK_raffle_localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      DROP CONSTRAINT "FK_article_localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle"
      DROP COLUMN "localeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article"
      DROP COLUMN "localeId"`,
    );
    await queryRunner.query(`DROP TABLE "locale"`);
  }
}

import { IsNull, MigrationInterface, Not, QueryRunner } from 'typeorm';
import { FixedCurrencyRate } from '../../resources/fixed-currency-rates/entities/fixed-currency-rate.entity';
import { Transfer } from '../../resources/transfers/entities/transfer.entity';
import { Network } from '../../resources/networks/entities/network.entity';
import {
  LONG_LENGTH,
  SHORT_LENGTH,
} from '../../utils/constants/common-constants';

export class AutomaticTransfersConfirmation1695893257695
  implements MigrationInterface
{
  name = 'automaticTransfersConfirmation1695893257695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction"
      ADD COLUMN "referralLevelPercentage" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ADD COLUMN "duplicateStatusId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ADD CONSTRAINT "FK_transfer_duplicateStatusId" FOREIGN KEY ("duplicateStatusId") REFERENCES "transferStatus" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION update_duplicate_status_id()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS $$
      BEGIN
          UPDATE "transfer" SET "duplicateStatusId" = NEW."statusId" WHERE "id" = NEW.id;
          RETURN NEW;
      END;
      $$`,
    );
    await queryRunner.query(
      `CREATE TRIGGER update_duplicate_status_trigger
      AFTER UPDATE OF "statusId" ON "transfer"
      FOR EACH ROW
      EXECUTE PROCEDURE update_duplicate_status_id();
      `,
    );
    await queryRunner.query(
      `ALTER TABLE "network"
      ADD COLUMN "tokenType" character varying(${SHORT_LENGTH})`,
    );
    await queryRunner.query(
      `UPDATE "network" SET "tokenType" = LOWER("displayName")`,
    );
    await queryRunner.query(
      `ALTER TABLE "network"
      ALTER COLUMN "tokenType" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "network"
      ADD CONSTRAINT "UQ_network_currencyId_tokenType" UNIQUE ("currencyId", "tokenType")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ADD COLUMN "networkId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ADD CONSTRAINT "FK_transfer_networkId" FOREIGN KEY ("networkId") REFERENCES "network" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fixedCurrencyRate"
      ADD COLUMN "networkId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "fixedCurrencyRate"
      ADD CONSTRAINT "FK_fixedCurrencyRate_networkId" FOREIGN KEY ("networkId") REFERENCES "network" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ALTER COLUMN "currencyId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "fixedCurrencyRate"
      ALTER COLUMN "currencyId" DROP NOT NULL`,
    );

    const transfers = await queryRunner.manager.find(Transfer, {
      where: { id: Not(IsNull()) },
    });
    // for (const transfer of transfers) {
    //   const network = await queryRunner.manager.findOneOrFail(Network, {
    //     where: { currencyId: transfer.currencyId },
    //   });
    //   await queryRunner.manager.update(
    //     Transfer,
    //     { id: transfer.id },
    //     { networkId: network.id },
    //   );
    // }
    const fixedCurrencyRates = await queryRunner.manager.find(
      FixedCurrencyRate,
      {
        where: { id: Not(IsNull()) },
      },
    );
    // for (const fixedCurrencyRate of fixedCurrencyRates) {
    //   const network = await queryRunner.manager.findOneOrFail(Network, {
    //     where: { currencyId: fixedCurrencyRate.currencyId },
    //   });
    //   await queryRunner.manager.update(
    //     FixedCurrencyRate,
    //     { id: fixedCurrencyRate.id },
    //     { networkId: network.id },
    //   );
    // }
    await queryRunner.query(
      `ALTER TABLE "transfer"
      ALTER COLUMN "networkId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "fixedCurrencyRate"
      ALTER COLUMN "networkId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "network"
      DROP CONSTRAINT "UQ_network_depositAddress"`,
    );

    await queryRunner.query(
      `CREATE TABLE "transferInfo"
      (
        "transferId" uuid NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "errorMessages" character varying(${LONG_LENGTH})[],
        "updatedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transferInfo" PRIMARY KEY ("transferId"),
        CONSTRAINT "UQ_transferInfo_transferId" UNIQUE ("transferId"),
        CONSTRAINT "FK_transferInfo_transferId" FOREIGN KEY ("transferId") REFERENCES "transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import { Product } from '../../resources/products/entities/product.entity';
import { LocaleEnum } from '../../resources/locales/locale.enum';
import { Locale } from '../../resources/locales/entities/locale.entity';
import { ProductLocaleContent } from '../../resources/products-locale-content/entities/product-locale-content.entity';
import { ProductEarningsSetting } from '../../resources/product-earnings-settings/entities/product-earnings-setting.entity';

export class AddNewProduct1695893257697 implements MigrationInterface {
  name = 'addNewProduct1695893257697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product"
      ADD COLUMN "isProlongsInvestment" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "product"
      ALTER COLUMN "isProlongsInvestment" SET NOT NULL`,
    );
    const insertResult = await queryRunner.manager.insert(Product, {
      displayName: 'Platinum',
      price: 300000,
      isProlongsInvestment: true,
    });
    const productId = insertResult.identifiers[0].id;
    const { id: ruId } = await queryRunner.manager.findOneByOrFail(Locale, {
      name: LocaleEnum.ru,
    });
    const { id: enId } = await queryRunner.manager.findOneByOrFail(Locale, {
      name: LocaleEnum.en,
    });
    await queryRunner.manager.insert(ProductLocaleContent, {
      productId,
      localeId: enId,
      features: [
        'Accrual percentage **0.85% per day**',
        'Deposit term **3 months**',
        'Interest accrual - **daily**',
        '**You can open a deposit an unlimited number of times**',
        '**The transition to this tariff will update the current investment, the completion date of the investment will be postponed by 90 days from the date of transition**',
      ],
    });
    await queryRunner.manager.insert(ProductLocaleContent, {
      productId,
      localeId: ruId,
      features: [
        'Процент начисления **0,85% в день**',
        'Срок вклада **3 месяца**',
        'Начисление процентов - **ежедневное**',
        '**Открыть вклад можно неограниченное количество раз**',
        '**Переход на этот тариф обновит текущую инвестицию, срок завершения инвестиции отодвинется на 90 дней с момента перехода**',
      ],
    });
    await queryRunner.manager.insert(ProductEarningsSetting, {
      date: new Date(),
      productId,
      percentage: 85,
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO
  }
}

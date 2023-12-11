import { ProductEarningsSetting } from '../../resources/product-earnings-settings/entities/product-earnings-setting.entity';

export interface IInvestmentIncomeAccrual {
  userId: string;
  investmentId: string;
  investmentAmountSnapshotDate: Date;
  todayProductsEarningsSettings: ProductEarningsSetting[];
  profitTransactionTypeId: string;
  withdrawalTransactionTypeId: string;
}

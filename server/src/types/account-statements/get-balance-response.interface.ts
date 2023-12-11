export interface IGetBalanceResponse {
  balance: number;
  invested: number;
  income: number;
  investmentDueDate: Date;
  lastUpdateDate: Date | null;
  lastIncomePercent: number;
  productId: string | null;
}

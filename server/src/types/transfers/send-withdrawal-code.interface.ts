export interface ISendWithdrawalCode {
  userId: string;
  fixedCurrencyRateId: string;
  amount: number;
  withdrawalAddress: string;
}

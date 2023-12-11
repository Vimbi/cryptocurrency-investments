export interface ICreateWithdrawalTransfer {
  code: string;
  userId: string;
  fixedCurrencyRateId: string;
  amount: number;
  typeId: string;
  statusId: string;
}

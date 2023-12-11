export interface ICreateTransfer {
  userId: string;
  fixedCurrencyRateId: string;
  amount: number;
  typeId: string;
  statusId: string;
  fromAddress?: string;
}

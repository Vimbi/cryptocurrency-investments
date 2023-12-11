export class InvestmentCompletedEvent {
  investmentDepositsAmount: number;
  income: number;
  userId: string;
  constructor({
    investmentDepositsAmount,
    income,
    userId,
  }: {
    investmentDepositsAmount: number;
    income: number;
    userId: string;
  }) {
    this.investmentDepositsAmount = investmentDepositsAmount;
    this.income = income;
    this.userId = userId;
  }
}

export type Balance = {
	balance: number;
	invested: number;
	income: number;
	lastUpdateDate: string | Date | null;
	investmentDueDate: string | Date | null;
	lastIncomePercent: number;
	productId: string;
};

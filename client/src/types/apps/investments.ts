import { Balance } from './accountStatementType';
import { TransferTypesType } from './transfersType';

export type TransactionType = Omit<TransferTypesType, 'name' | 'displayName'> & {
	name?: TransferTypesType['name'] | 'income';
	displayName: TransferTypesType['displayName'] | 'Income';
	createdAt: string;
	localeId: string;
	typeId: string;
	updatedAt: null | string;
};

export type InvestmentTransaction = {
	id: string;
	investmentId: string;
	amount: number;
	typeId: string;
	productEarningsSettingDate: null | string | Date;
	productEarningsSettingProductId: null | string | Date;
	createdAt: string | Date;
	type: TransactionType;
};

export type AccrualsType = {
	id: string;
	amount: number;
	createdAt: string;
	type: { localeContent: TransactionType[] };
};

export type ReferralIncomeType = {
	amount: number;
	createdAt: string;
	id: string;
	investmentId: string;
	investmentTransactionId: string | null;
	transferId: string | null;
	type: TransactionType;
	typeId: string;
	userId: string;
};

// export type Investment = {
// 	id: string;
// 	amount: number;
// 	income: number;
// 	productId: string;
// 	createdAt: string | Date;
// 	updatedAt: null | string | Date;
// 	completedAt: null | string | Date;
// 	canceledAt: null | string | Date;
// 	investmentTransactions: InvestmentTransaction[];
// };

export type Investment = InvestmentInfoType & Balance;

export type InvestmentInfoType = {
	balance: number;
	totalIncome: number | undefined;
	finesNumber: number;
	finesAmount: number;
};

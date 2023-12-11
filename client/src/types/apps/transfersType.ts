import { CurrencieType } from './currenciesType';
import { NetworkType } from './networkType';

export type FetchTransfersParams = {
	page: number;
	limit: number;
	statusId?: string;
	typeId?: string;
	localeId?: string;
	currencyId?: string;
	afterDate?: string | Date;
	beforeDate?: string | Date;
};
export type FetchTransactionsParams = {
	page: number;
	limit: number;
	typeId?: string | null;
	localeId?: string;
	afterDate?: string | Date;
	beforeDate?: string | Date;
	userId?: string | null;
};
export type TransferType = {
	id?: string;
	userId?: string;
	currencyId?: string;
	currencyAmount?: string;
	amount?: number;
	typeId?: string;
	statusId?: string;
	txId?: null | string;
	withdrawalAddress?: null | string;
  fromAddress?: null | string;
	note?: null | string;
	createdAt?: string;
	updatedAt?: null | string;
	endedAt?: string;
	completedAt?: null | string;
	status?: TransferStatusesType;
	network: NetworkType;
	type?: TransferTypesType;
};

export type TransferTypesType = {
	id: string;
	name: 'deposit' | 'withdrawal';
	displayName: 'Deposit' | 'Withdrawal';
	createdAt: string;
	updatedAt?: null | string;
	localeContent: {
		createdAt: string;
		displayName: string;
		localeId: string;
		typeId: string;
	}[];
};
export type TransferStatusesType = {
	id: string;
	name: 'pending' | 'processed' | 'completed' | 'canceled';
	displayName: 'Pending' | 'Processed' | 'Completed' | 'Canceled';
	createdAt: string;
	updatedAt: null | string;
	localeContent: {
		createdAt: string;
		displayName: string;
		localeId: string;
		statusId: string;
	}[];
};

export type TypeTransaction = {
	amount: 50;
	completedAt: null;
	createdAt: string;
	currency: CurrencieType;
	currencyAmount: string;
	currencyId: string;
	endedAt: string;
	id: string;
	note: null | string;
	status: TransferStatusesType;
	statusId: string;
	txId: null | string;
	type: TypeTransactionType;
  typeDisplayName: string;
  toUserFirstName: string;
  toUserLastName: string;
  fromUserFirstName: string;
  fromUserLastName: string;
  toUserId: string;
  fromUserId: string;
	typeId: string;
	updatedAt: string;
	userId: string;
	withdrawalAddress: null;
};

export type TypeTransactionType = {
	createdAt: string;
	id: string;
	localeContent: {
		createdAt: string;
		displayName: string;
		localeId: string;
		typeId: string;
		updatedAt: null | string;
	}[];
	name: string;
	updatedAt: null | string;
};

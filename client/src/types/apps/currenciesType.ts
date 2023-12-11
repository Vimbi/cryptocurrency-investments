import { ThemeColor } from 'src/@core/layouts/types';

export type CurrencieType = {
	id?: string;
	displayName?: string;
	symbol?: string;
  isSenderAddressRequired?: boolean;
	createdAt?: string;
	updatedAt?: string | null;
	avatarColor?: ThemeColor;
	[key: string]: any;
};

export type FixedCurrency = {
	createdAt: string;
	currencyId: string;
	endedAt: string;
	id: string;
	rate: number;
};

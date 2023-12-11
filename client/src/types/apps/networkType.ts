import { CurrencieType } from "./currenciesType";

export type NetworkType = {
	id?: string;
  currency?: CurrencieType;
	currencyId?: string;
	displayName?: string;
	description?: string;
	depositAddress?: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: any;
};

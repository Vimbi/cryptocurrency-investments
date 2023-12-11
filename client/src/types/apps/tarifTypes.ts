export type ProductTarifType = {
	cryptocurrencyPrices: CryptoCurrencyType[];
	id: string;
	productId: string;
	displayName: string;
	price: number;
	earnings: string;
	createdAt: string;
	updatedAt: null | string;
	deletedAt: null | string;
	imgSrc: string;
  isProlongsInvestment: boolean;
	features: string[];
	localeContent: any;
	localeId?: string;
};
export type ProductTarifPriceType = {
	cryptocurrencyPrices: CryptoCurrencyType[];
	id: string;
	displayName: string;
	price: number;
	earningsPercentage: number;
	createdAt: string;
	updatedAt: null | string;
	deletedAt: null | string;
};
export type CryptoCurrencyType = {
	symbol: string;
	price: number;
};

import { Dispatch } from 'redux';

export interface FetchEarningsParams {
	sort?: string[];
	page: number;
	limit: number;
	productId?: string;
	afterDate?: string | Date;
	beforeDate?: string | Date;
}

export interface EarningsData {
	item: {
		date: Date | string;
		productId: string;
		percentage: number | string;
	};
	filter?: FetchEarningsParams;
	callBackError?: () => void;
}

export interface Redux {
	getState: any;
	dispatch: Dispatch<any>;
	rejectWithValue: any;
}

export interface ProductItemWithEarnings {
	id: string;
	name: string;
}

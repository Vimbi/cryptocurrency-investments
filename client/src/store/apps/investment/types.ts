import { Dispatch } from 'redux';
import { AccrualsType, Investment, InvestmentInfoType, ReferralIncomeType } from 'src/types/apps/investments';

export type InvestmentParams = {
	sort?: string[];
	page: number;
	limit: number;
	afterDate?: string;
	beforeDate?: string;
};

export interface Redux {
	getState: any;
	dispatch: Dispatch<any>;
	rejectWithValue: (value: unknown) => unknown;
}

export interface IInitialState {
	investments: {
		data: Investment[];
		filter: {
			limit: number;
			page: number;
			itemCount: number;
		};
	};
	currentInvestment: InvestmentInfoType | null;
	accruals: {
		data: AccrualsType[];
		limit: number;
		page: number;
		itemCount: number;
	};
	referralIncome: {
		data: ReferralIncomeType[];
		limit: number;
		page: number;
		itemCount: number;
	};
}

export interface CreateInvestmentProps {
	data: {
		amount: string | number;
		productId: string;
	};
}

export interface ReplenishInvestmentProps {
	data: {
		amount: string | number;
	};
}

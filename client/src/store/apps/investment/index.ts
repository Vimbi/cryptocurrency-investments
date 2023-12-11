// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';

import { CreateInvestmentProps, IInitialState, InvestmentParams, ReplenishInvestmentProps } from './types';
import { AccrualsType, Investment, InvestmentInfoType } from 'src/types/apps/investments';

export const getInvestments = createAsyncThunk(
	'appInvestment/getInvestments',
	async (data: InvestmentParams, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.get<{
				entities: Investment[];
				itemCount: number;
				limit: number;
				page: number;
			}>(`${authConfig.baseApiUrl}/investments`, {
				params: data,
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const getCurrentInvestment = createAsyncThunk(
	'appInvestment/getInvestmentsCurrent',
	async (_, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.get<InvestmentInfoType>(`${authConfig.baseApiUrl}/investments/info`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const cancelInvestment = createAsyncThunk(
	'appInvestment/cancelInvestment',
	async (data: { onSuccess?: () => void; onError?: () => void }, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			await axios.patch(
				`${authConfig.baseApiUrl}/investments/cancel`,
				{},
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			data?.onSuccess && data.onSuccess();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				data?.onError && data.onError();
			}

			return rejectWithValue(error);
		}
	}
);

export const createInvestment = createAsyncThunk(
	'appInvestment/createInvestment',
	async ({ data }: CreateInvestmentProps, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const res = await axios.post(`${authConfig.baseApiUrl}/investments`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return res;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const replenishInvestment = createAsyncThunk(
	'appInvestment/replenishInvestment',
	async ({ data }: ReplenishInvestmentProps, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const res = await axios.patch(`${authConfig.baseApiUrl}/investments/replenish`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return res;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);
export const getAccruals = createAsyncThunk(
	'appInvestment/getAccruals',
	async (data: InvestmentParams, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.get<{
				entities: AccrualsType[];
				itemCount: number;
				limit: number;
				page: number;
			}>(`${authConfig.baseApiUrl}/investments-transactions`, {
				params: data,
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return response.data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const getRewards = createAsyncThunk(
	'appInvestment/getRewards',
	async (data: InvestmentParams, { rejectWithValue }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const res = await axios.get(`${authConfig.baseApiUrl}/transactions/rewards`, {
				params: data,
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});

			return res.data;
		} catch (e) {
			return rejectWithValue(e);
		}
	}
);

export const initialState: IInitialState = {
	investments: {
		data: [],
		filter: {
			page: 1,
			limit: 30,
			itemCount: 0
		}
	},
	currentInvestment: null,
	accruals: {
		data: [],
		page: 1,
		limit: 10,
		itemCount: 0
	},
	referralIncome: {
		data: [],
		page: 1,
		limit: 10,
		itemCount: 0
	}
};

export const appInvestmentSlice = createSlice({
	name: 'appInvestment',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(
			getInvestments.fulfilled,
			(
				state,
				action: PayloadAction<{ entities: Investment[]; itemCount: number; limit: number; page: number }>
			) => {
				state.investments = {
					data: action.payload.entities,
					filter: {
						limit: action.payload.limit,
						page: action.payload.page,
						itemCount: action.payload.itemCount
					}
				};
			}
		);
		builder.addCase(getCurrentInvestment.fulfilled, (state, action: PayloadAction<InvestmentInfoType>) => {
			state.currentInvestment = action.payload;
		});
		builder.addCase(
			getAccruals.fulfilled,
			(
				state,
				action: PayloadAction<{ entities: AccrualsType[]; itemCount: number; limit: number; page: number }>
			) => {
				state.accruals = {
					data: action.payload.entities,
					limit: action.payload.limit,
					page: action.payload.page,
					itemCount: action.payload.itemCount
				};
			}
		);
		builder.addCase(getRewards.fulfilled, (state, action) => {
			state.referralIncome = {
				data: action.payload.entities,
				limit: action.payload.limit,
				page: action.payload.page,
				itemCount: action.payload.itemCount
			};
		});
	}
});

export default appInvestmentSlice.reducer;

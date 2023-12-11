// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';
import authConfig from 'src/configs/auth';

// ** Types
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { EarningsData, FetchEarningsParams, ProductItemWithEarnings, Redux } from './types';
import { EarningType } from 'src/types/apps/earnings';

// ** Fetch Events
export const fetchProduct = createAsyncThunk('appEarnings/fetchProduct', async (params: { localeId: string }) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get<{ entities: ProductTarifType[] }>(authConfig.baseApiUrl + '/products', {
		params,
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const fetchEarnings = createAsyncThunk('appEarnings/fetchEarnings', async (params: FetchEarningsParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get<{ entities: EarningType[] }>(
		authConfig.baseApiUrl + '/product-earnings-settings',
		{
			params,
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		}
	);

	return response.data;
});

export const createEarning = createAsyncThunk(
	'appEarnings/createEarning',
	async (data: EarningsData, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			await axios.post(
				authConfig.baseApiUrl + '/product-earnings-settings',
				{ ...data.item, percentage: Number(data.item.percentage) },
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			if (data?.filter) {
				dispatch(fetchEarnings(data.filter));
			}
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const updateEarning = createAsyncThunk(
	'appEarnings/updateEarning',
	async (data: EarningsData, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			await axios.patch(
				authConfig.baseApiUrl + '/product-earnings-settings',
				{ percentage: Number(data.item.percentage) },
				{
					params: {
						productId: data.item.productId,
						date: data.item.date
					},
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			if (data?.filter) {
				dispatch(fetchEarnings(data.filter));
			}
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

interface InitialState {
	isLoading: boolean;
	products: ProductTarifType[];
	earnings: EarningType[];
	selectedProducts: ProductItemWithEarnings[];
	selectedEarning: Record<string, any> | null;
}

const initialState: InitialState = {
	isLoading: false,
	products: [],
	earnings: [],
	selectedProducts: [],
	selectedEarning: null
};

export const appCalendarSlice = createSlice({
	name: 'appEarnings',
	initialState,
	reducers: {
		setSelectedProduct: (state, action: PayloadAction<ProductItemWithEarnings[]>) => {
			state.selectedProducts = action.payload;
		},
		handleSelectEarning: (state, action: PayloadAction<Record<string, any>>) => {
			state.selectedEarning = action.payload;
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchEarnings.pending, state => {
			state.isLoading = true;
		});
		builder.addCase(fetchEarnings.fulfilled, (state, action: PayloadAction<{ entities: EarningType[] }>) => {
			state.earnings = action.payload.entities;
			state.isLoading = false;
		});
		builder.addCase(fetchEarnings.rejected, state => {
			state.isLoading = false;
		});
		builder.addCase(fetchProduct.fulfilled, (state, action: PayloadAction<{ entities: ProductTarifType[] }>) => {
			state.products = action.payload.entities;
		});
	}
});
export const { handleSelectEarning, setSelectedProduct } = appCalendarSlice.actions;

export default appCalendarSlice.reducer;

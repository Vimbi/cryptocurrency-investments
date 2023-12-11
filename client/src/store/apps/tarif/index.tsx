// ** Redux Imports
import { createSlice, createAsyncThunk, Dispatch } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { UsersType } from 'src/types/apps/userTypes';

interface DataParams {
	limit: number;
	page: number;
	id?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	localeId?: string;
}
interface Redux {
	rejectWithValue: any;
	getState: any;
	dispatch: Dispatch<any>;
}

export const fetchData = createAsyncThunk('appTarif/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/products`, {
		params,
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const fetchDataPrices = createAsyncThunk('appTarif/fetchDataPrices', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/products/prices`, {
		params,
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const editTarif = createAsyncThunk(
	'appTarif/editTarif',
	async (values: Partial<ProductTarifType>, { rejectWithValue, getState, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/products`, values, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			const params = getState().tarif;
			dispatch(fetchData({ limit: params.limit, page: params.page, localeId: values.localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const appTarifSlice = createSlice({
	name: 'appTarif',
	initialState: {
		data: [],
		itemCount: 1,
		limit: 10,
		page: 1,
		user: null as UsersType | null
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action) => {
			state.data = action.payload.entities;
			state.itemCount = action.payload.itemCount;
			state.page = action.payload.page;
			state.limit = action.payload.limit;
		});
		builder.addCase(fetchDataPrices.fulfilled, (state, action) => {
			state.data = action.payload.entities;
			state.itemCount = action.payload.itemCount;
			state.page = action.payload.page;
			state.limit = action.payload.limit;
		});
	}
});

export default appTarifSlice.reducer;

// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Types and Api base URL import
import authConfig from 'src/configs/auth';

// import { ManagerAddType, ManagerType } from 'src/types/apps/managersTypes';
import { CurrencieType, FixedCurrency } from 'src/types/apps/currenciesType';

interface Redux {
	rejectWithValue: any;
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Stores
export const fetchData = createAsyncThunk('appCurrencies/fetchData', async () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/currencies`, {
		// params: { ...params, sort: `["createdAt","DESC"]` }
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const addCurrencie = createAsyncThunk(
	'appCurrencies/addCurrencie',
	async (reqData: CurrencieType, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post(
				`${authConfig.baseApiUrl}/currencies`,
				{ ...reqData, symbol: reqData.symbol?.toUpperCase() },
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			dispatch(fetchData());

			return response.data;
		} catch (err: any) {
			return rejectWithValue(err.response.data);
		}
	}
);

export const deleteCurrencie = createAsyncThunk(
	'appCurrencies/deleteCurrencie',
	async (id: string, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.delete(`${authConfig.baseApiUrl}/currencies/${id}`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData());

			return response.status;
		} catch (e) {
			return rejectWithValue(e);
		}
	}
);
export const editCurrencie = createAsyncThunk(
	'appCurrencies/editCurrencie',
	async (reqData: { id: string; data: CurrencieType }, { dispatch, rejectWithValue }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/currencies/${reqData.id}`, reqData.data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData());

			return response.status;
		} catch (err: any) {
			return rejectWithValue(err.response.data);
		}
	}
);

export const getFixedCurrency = createAsyncThunk(
	'appCurrencies/getFixedCurrency',
	async (data: { networkId: string | undefined }, { rejectWithValue }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post<FixedCurrency>(
				authConfig.baseApiUrl + '/fixed-currency-rates',
				{ networkId: data.networkId },
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(error.response?.data);
			}
		}
	}
);

export const setCurrentCurrencie = (data: CurrencieType | null) => {
	return { type: 'appCurrencies/setCurrentCurrencie', payload: data };
};

export const appCurrenciesSlice = createSlice({
	name: 'appCurrencies',
	initialState: {
		data: <CurrencieType[] | null>null,
		currentCurrencie: <CurrencieType | null>null,
		fixedCurrency: <FixedCurrency | null>null

		// itemCount: 1,
		// limit: 10,
		// page: 1,
		// managers: <ManagerType | any>[]
	},
	reducers: {
		setCurrentCurrencie: (state, action) => {
			state.currentCurrencie = action.payload;
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action) => {
			state.data = action.payload;
		});
		builder.addCase(getFixedCurrency.fulfilled, (state, action: PayloadAction<FixedCurrency>) => {
			state.fixedCurrency = action.payload;
		});
	}
});

export default appCurrenciesSlice.reducer;

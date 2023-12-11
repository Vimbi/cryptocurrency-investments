// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { RaffleType } from 'src/types/apps/raffleTypes';

interface DataParams {
	limit?: number;
	page?: number;
	theme?: string;
	localeId?: string;
}
interface Redux {
	rejectWithValue: any;
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Raffles
export const fetchData = createAsyncThunk('appRaffles/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/raffles/admin`, {
		params: { ...params, sort: `["createdAt","DESC"]` },
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const createRaffle = createAsyncThunk(
	'appRaffles/createRaffle',
	async (data: RaffleType, { rejectWithValue, getState, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post(`${authConfig.baseApiUrl}/raffles`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			const params = getState().raffles;
			dispatch(fetchData({ limit: params.limit, page: params.page, localeId: data.localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const deleteRaffle = createAsyncThunk(
	'appRaffles/deleteRaffle',
	async ({ id, localeId }: { id: string; localeId: string }, { rejectWithValue, getState, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.delete(`${authConfig.baseApiUrl}/raffles/${id}`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			const params = getState().raffles;
			dispatch(fetchData({ limit: params.limit, page: params.page, localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const editRaffle = createAsyncThunk(
	`appRaffles/editRaffle`,
	async (data: RaffleType, { rejectWithValue, getState, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/raffles`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			const params = getState().raffles;
			dispatch(fetchData({ limit: params.limit, page: params.page, localeId: data.localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const appRafflesSlice = createSlice({
	name: 'appRaffles',
	initialState: {
		data: [],
		itemCount: 1,
		limit: 10,
		page: 1
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action) => {
			state.data = action.payload.entities;
			state.itemCount = action.payload.itemCount;
			state.page = action.payload.page;
			state.limit = action.payload.limit;
		});
	}
});

export default appRafflesSlice.reducer;

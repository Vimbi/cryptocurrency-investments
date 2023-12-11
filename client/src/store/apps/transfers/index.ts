// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Types and Api base URL import
import authConfig from 'src/configs/auth';

import {
	FetchTransfersParams,
	FetchTransactionsParams,
	TransferStatusesType,
	TransferType
} from 'src/types/apps/transfersType';

// interface Redux {
// 	rejectWithValue: any;
// 	getState: any;
// 	dispatch: Dispatch<any>;
// }

// ** Fetch Transfer
export const fetchTransfers = createAsyncThunk('appTransfers/fetchData', async (params: FetchTransfersParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/transfers`, {
		params: { ...params },
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const fetchTransfersAdmin = createAsyncThunk(
	'appTransfers/fetchDataAdmin',
	async (params: FetchTransfersParams) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get(`${authConfig.baseApiUrl}/transfers/admin`, {
			params: { ...params },
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	}
);

export const fetchTransferById = createAsyncThunk(
	'appTransfers/fetchDataById',
	async ({ id, localeId }: { id: string; localeId: string }) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get<TransferType>(`${authConfig.baseApiUrl}/transfers/${id}`, {
			params: {
				id,
				localeId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	}
);

export const fetchTransferStatuses = createAsyncThunk(
	'appTransfers/fetchTransferStatuses',
	async ({ localeId }: { localeId: string }) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get<TransferStatusesType[]>(`${authConfig.baseApiUrl}/transfer-statuses`, {
			params: { localeId },
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	}
);

export const fetchTransactionsAdmin = createAsyncThunk(
	'appTransfers/fetchTransactions',
	async (params: FetchTransactionsParams) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get<any>(`${authConfig.baseApiUrl}/admin/transactions`, {
			params,
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	}
);

export const appTransfersSlice = createSlice({
	name: 'appTransfers',
	initialState: {
		data: [],
		itemCount: 1,
		limit: 10,
		page: 1,
		transferCard: {
			isLoaded: <boolean>false,
			data: <TransferType | null>null
		},
		transferStatuses: <TransferStatusesType[] | null>null,
		transactions: {
			data: [],
			itemCount: 1,
			limit: 10,
			page: 1
		}
	},
	reducers: {
		clearCard(state) {
			state.transferCard = {
				isLoaded: false,
				data: null
			};
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchTransactionsAdmin.fulfilled, (state, action) => {
			state.transactions.data = action.payload.entities;
			state.transactions.itemCount = action.payload.itemCount;
			state.transactions.page = action.payload.page;
			state.transactions.limit = action.payload.limit;
		});
		builder.addCase(fetchTransfersAdmin.fulfilled, (state, action) => {
			state.data = action.payload.entities;
			state.itemCount = action.payload.itemCount;
			state.page = action.payload.page;
			state.limit = action.payload.limit;
		});
		builder.addCase(fetchTransferById.pending, state => {
			state.transferCard.isLoaded = false;
		});
		builder.addCase(fetchTransferById.fulfilled, (state, action: PayloadAction<TransferType>) => {
			state.transferCard.data = action.payload;
			state.transferCard.isLoaded = true;
		});
		builder.addCase(fetchTransferById.rejected, state => {
			state.transferCard = {
				isLoaded: true,
				data: null
			};
		});
		builder.addCase(fetchTransferStatuses.fulfilled, (state, action: PayloadAction<TransferStatusesType[]>) => {
			state.transferStatuses = action.payload;
		});
	}
});

export default appTransfersSlice.reducer;

export const { clearCard } = appTransfersSlice.actions;

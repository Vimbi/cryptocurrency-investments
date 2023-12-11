// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { WalletType } from 'src/types/apps/userTypes';

interface DataParams {
	limit?: number;
	page?: number;
	search?: string;
	networkId?: string;
}

export const fetchWalletData = createAsyncThunk('appUserWallets/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get<{ entities: WalletType[]; itemCount: number; limit: number; page: 1 }>(
		`${authConfig.baseApiUrl}/user-wallets`,
		{
			params,
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		}
	);

	return response.data;
});
export const createWallet = createAsyncThunk(
	'appUserWallets/createWallet',
	async (data: WalletType, { rejectWithValue, dispatch }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.post(`${authConfig.baseApiUrl}/user-wallets`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchWalletData({}));

			return response.data;
		} catch (e) {
			return rejectWithValue(e);
		}
	}
);
export const deleteWallet = createAsyncThunk(
	'appUserWallets/deleteWallet',
	async (id: string, { rejectWithValue, dispatch }) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.delete(`${authConfig.baseApiUrl}/user-wallets/${id}`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchWalletData({}));

			return response.data;
		} catch (e) {
			return rejectWithValue(e);
		}
	}
);

export const appUserWalletsSlice = createSlice({
	name: 'appUserWallets',
	initialState: {
		data: <WalletType[]>[],
		itemCount: 1,
		limit: 10,
		page: 1
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchWalletData.fulfilled, (state, action) => {
			state.data = action.payload.entities;
			state.itemCount = action.payload.itemCount;
			state.page = action.payload.page;
			state.limit = action.payload.limit;
		});
	}
});

export default appUserWalletsSlice.reducer;

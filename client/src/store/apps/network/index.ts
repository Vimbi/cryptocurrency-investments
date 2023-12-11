// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Types and Api base URL import
import authConfig from 'src/configs/auth';
import { NetworkType } from 'src/types/apps/networkType';

interface DataParams {
	limit?: number;
	page?: number;
	currencyId?: string;
}
interface Redux {
	rejectWithValue: any;
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Stores
export const fetchData = createAsyncThunk('appNetworks/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/networks`, {
		params: params,
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const addNetwork = createAsyncThunk(
	'appNetworks/addNetwork',
	async (reqData: NetworkType, { rejectWithValue, dispatch, getState }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post(`${authConfig.baseApiUrl}/networks`, reqData, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData(getState().networks.params));

			return response.data;
		} catch (err: any) {
			return rejectWithValue(err.response);
		}
	}
);

export const deleteNetwork = createAsyncThunk(
	'appNetworks/deleteNetwork',
	async (id: string, { dispatch, getState }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.delete(`${authConfig.baseApiUrl}/networks/${id}`, {
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		dispatch(fetchData(getState().networks.params));

		return response.status;
	}
);
export const editNetwork = createAsyncThunk(
	'appNetworks/editNetwork',
	async (reqData: { id: string; data: NetworkType }, { rejectWithValue, dispatch, getState }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/networks/${reqData.id}`, reqData.data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData(getState().networks.params));

			return response.status;
		} catch (err: any) {
			return rejectWithValue(err.response);
		}
	}
);
export const setCurrentNetwork = (data: NetworkType | null) => {
	return { type: 'appNetworks/setCurrentNetwork', payload: data };
};
export const appNetworksSlice = createSlice({
	name: 'appNetworks',
	initialState: {
		data: <NetworkType | any>[],
		currentNetwork: <NetworkType | null>null

		// itemCount: 1,
		// limit: 10,
		// page: 1,
		// managers: <ManagerType | any>[]
	},
	reducers: {
		setCurrentNetwork: (state, action) => {
			state.currentNetwork = action.payload;
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action) => {
			state.data = action.payload;

			// state.itemCount = action.payload.itemCount;
			// state.page = action.payload.page;
			// state.limit = action.payload.limit;
		});
	}
});

export default appNetworksSlice.reducer;

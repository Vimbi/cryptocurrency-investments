// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Config
import authConfig from 'src/configs/auth';

// ** Types
import { IInitialState } from './types';
import { Balance } from 'src/types/apps/accountStatementType';

// ** Fetch Mails
export const getBalance = createAsyncThunk('appAccountStatement/fetchBalance', async () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

	const response = await axios.get<Balance>(`${authConfig.baseApiUrl}/account-statements/get-balance`, {
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

const initialState: IInitialState = {
	balance: {
		balance: 0,
		invested: 0,
		income: 0,
		lastUpdateDate: null,
		lastIncomePercent: 0,
		productId: '',
		investmentDueDate: null
	}
};

export const appAccountStatementSlice = createSlice({
	name: 'appAccountStatement',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(getBalance.fulfilled, (state, action: PayloadAction<Balance>) => {
			state.balance = action.payload;
		});
	}
});

export default appAccountStatementSlice.reducer;

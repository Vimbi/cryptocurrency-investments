// ** Redux Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { ReferralType } from 'src/types/apps/referralType';

interface Redux {
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Users
export const fetchData = createAsyncThunk('appReferrals/fetchData', async () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get<ReferralType[]>(`${authConfig.baseApiUrl}/referral-levels`, {
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const updateReferral = createAsyncThunk(
	'appReferrals/updateReferral',
	async (data: ReferralType, { dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.patch(`${authConfig.baseApiUrl}/referral-levels`, data, {
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		dispatch(fetchData());

		return response.data;
	}
);

export const appReferralsSlice = createSlice({
	name: 'appReferrals',
	initialState: { levels: <ReferralType[]>[] },
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action: PayloadAction<ReferralType[]>) => {
			state.levels = action.payload;
		});
	}
});

export default appReferralsSlice.reducer;

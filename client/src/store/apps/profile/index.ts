// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';

import { UsersType } from 'src/types/apps/userTypes';

interface Redux {
	getState: any;
	dispatch: Dispatch<any>;
	rejectWithValue: (value: unknown) => unknown;
}

type UpdateProfile = Partial<UsersType>;

type UpdatePassword = {
	oldPassword: string;
	newPassword: string;
};

type EnableOrDisableTwoFactor = {
	twoFactorAuthenticationCode: string;
	successCalback?: () => void;
	errorCalback?: () => void;
};

// ** Fetch Profile by Id
export const fetchProfileData = createAsyncThunk('appProfile/fetchProfileData', async (_, { rejectWithValue }) => {
	try {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get(`${authConfig.baseApiUrl}/auth/me`, {
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const updateProfilePassword = createAsyncThunk(
	'appProfile/updateProfilePassword',
	async (data: UpdatePassword, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.patch<{ result: boolean }>(
				`${authConfig.baseApiUrl}/auth/me/change-password`,
				data,
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			dispatch(fetchProfileData());

			return response.status;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

export const updateProfile = createAsyncThunk(
	'appProfile/updateProfile',
	async (data: UpdateProfile, { dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

		const response = await axios.patch(`${authConfig.baseApiUrl}/auth/me`, data, {
			headers: { Authorization: `Bearer ${storedToken}` }
		});
		dispatch(fetchProfileData());

		return response.status;
	}
);

export const updateEmail = createAsyncThunk(
	'appProfile/updateEmail',
	async (data: Pick<UpdateProfile, 'email'>, { rejectWithValue }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/auth/me/change-email`, data, {
				headers: { Authorization: `Bearer ${storedToken}` }
			});

			return response;
		} catch (err) {
			return rejectWithValue(err);
		}
	}
);

export const enableTwoFactor = createAsyncThunk(
	'appProfile/enableTwoFactor',
	async (data: EnableOrDisableTwoFactor, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

			const response = await axios.post(
				`${authConfig.baseApiUrl}/auth/2fa/turn-on`,
				{
					twoFactorAuthenticationCode: data.twoFactorAuthenticationCode
				},
				{
					headers: { Authorization: `Bearer ${storedToken}` }
				}
			);
			if (data?.successCalback) data.successCalback();

			dispatch(fetchProfileData());

			return response.status;
		} catch (error) {
			if (axios.isAxiosError(error) && data?.errorCalback) data.errorCalback();

			return rejectWithValue(error);
		}
	}
);

export const disableTwoFactor = createAsyncThunk(
	'appProfile/disableTwoFactor',
	async (data: EnableOrDisableTwoFactor, { dispatch, rejectWithValue }: Redux) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

			const response = await axios.post(
				`${authConfig.baseApiUrl}/auth/2fa/turn-off`,
				{
					twoFactorAuthenticationCode: data.twoFactorAuthenticationCode
				},
				{
					headers: { Authorization: `Bearer ${storedToken}` }
				}
			);

			if (data?.successCalback) data.successCalback();

			dispatch(fetchProfileData());

			return response.status;
		} catch (error) {
			if (axios.isAxiosError(error) && data?.errorCalback) data.errorCalback();

			return rejectWithValue(error);
		}
	}
);

export const appProfileSlice = createSlice({
	name: 'appProfile',
	initialState: {
		profile: null as UsersType | null
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchProfileData.fulfilled, (state, action) => {
			state.profile = action.payload;
		});
	}
});

export default appProfileSlice.reducer;

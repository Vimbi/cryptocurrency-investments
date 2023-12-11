// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { UsersType } from 'src/types/apps/userTypes';

interface DataParams {
	limit: number;
	page: number;
	userId?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	childId?: string;
}

interface UpdateUser {
	userId: string;
	role?: string | 'admin' | 'super_admin';
	action: string;
	block?: boolean;
	restrict?: boolean;
}

interface Redux {
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/users`, {
		params,
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

// ** Fetch User by Id
export const fetchUserData = createAsyncThunk('appUsers/fetchUserData', async (id: string, { rejectWithValue }) => {
	try {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const response = await axios.get(`${authConfig.baseApiUrl}/users/${id}`, {
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});

		return response.data;
	} catch (error) {
		// Отклонить с помощью значения ошибки
		return rejectWithValue(error);
	}
});

// ** Add User
export const addUser = createAsyncThunk(
	'appUsers/addUser',
	async (data: { [key: string]: number | string }, { getState, dispatch }: Redux) => {
		const response = await axios.post('/apps/users/add-user', {
			data
		});
		dispatch(fetchData(getState().user.params));

		return response.data;
	}
);

// ** Delete User
export const deleteUser = createAsyncThunk(
	'appUsers/deleteUser',
	async (id: number | string, { getState, dispatch }: Redux) => {
		const response = await axios.delete('/apps/users/delete', {
			data: id
		});
		dispatch(fetchData(getState().user.params));

		return response.data;
	}
);

// ** Update User (Block and Mute)
export const updateUser = createAsyncThunk(
	'appUsers/updateUser',
	async (req: UpdateUser, { getState, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const reqData =
			req.action === 'block'
				? { isBanned: !!req.block }
				: req.action === 'restrict'
				? { isRestrict: !!req.restrict }
				: null;
		const response = await axios.patch(
			`${authConfig.baseApiUrl}/users/${req.userId}/${req.role === 'super_admin' ? 'super-admin' : req.role}`,
			reqData,
			{ headers: { Authorization: `Bearer ${storedToken}` } }
		);
		dispatch(fetchData(getState().user.params));

		return response.status;
	}
);

export const appUsersSlice = createSlice({
	name: 'appUsers',
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
		builder.addCase(fetchUserData.fulfilled, (state, action) => {
			state.user = { id: action.meta.arg, ...action.payload };
		});
	}
});

export default appUsersSlice.reducer;

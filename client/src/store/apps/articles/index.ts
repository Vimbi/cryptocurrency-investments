// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { ArticleType } from 'src/types/apps/articleTypes';

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

// ** Fetch Articles
export const fetchData = createAsyncThunk('appArticles/fetchData', async (params: DataParams) => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const response = await axios.get(`${authConfig.baseApiUrl}/articles/admin`, {
		params: { ...params, sort: `["createdAt","DESC"]` },
		headers: {
			Authorization: `Bearer ${storedToken}`
		}
	});

	return response.data;
});

export const deleteArtcle = createAsyncThunk(
	'appArticles/deleteArticle',
	async ({ id, localeId }: { id: string; localeId: string }, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.delete(`${authConfig.baseApiUrl}/articles/${id}`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData({ localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const createArticle = createAsyncThunk(
	'appArticles/createArticle',
	async (data: ArticleType, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post(`${authConfig.baseApiUrl}/articles/`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData({ localeId: data.localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const editArticle = createAsyncThunk(
	`appArticles/editArticle`,
	async (data: ArticleType, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/articles/`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData({ localeId: data.localeId }));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

// export const editStatus = createAsyncThunk(
// 	'appArticles/editStatus',
// 	async (reqData, { rejectWithValue, getState, dispatch }: Redux) => {
// 		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
// 		try {
// 			const response = await axios.patch(
// 				`${authConfig.baseApiUrl}/announcements/${reqData.id}/${reqData.status}`,
// 				reqData?.cancelReasons || null,
// 				{
// 					headers: {
// 						Authorization: `Bearer ${storedToken}`
// 					}
// 				}
// 			);
// 			dispatch(fetchData(getState().user.params));

// 			return response.data;
// 		} catch (err: any) {
// 			return rejectWithValue(err.response.data);
// 		}
// 	}
// );

export const appArticlesSlice = createSlice({
	name: 'appArticles',
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

export default appArticlesSlice.reducer;

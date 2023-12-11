// ** Redux Imports
import { Dispatch } from 'redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ** Axios Imports
import axios from 'axios';

// ** Api base URL import
import authConfig from 'src/configs/auth';
import { ArticleTypeType } from 'src/types/apps/articleTypes';

interface Redux {
	rejectWithValue: any;
	getState: any;
	dispatch: Dispatch<any>;
}

// ** Fetch Articles
export const fetchData = createAsyncThunk('appArticleTypes/fetchData', async (localeId?: string) => {
	const response = await axios.get(
		`${authConfig.baseApiUrl}/article-types`,
		!!localeId
			? {
					params: {
						localeId
					}
			  }
			: {}
	);

	return response.data;
});

export const deleteArtcleType = createAsyncThunk(
	'appArticleTypes/deleteArticleType',
	async (id: string, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.delete(`${authConfig.baseApiUrl}/article-types/${id}`, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData(''));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const createArticleType = createAsyncThunk(
	'appArticleTypes/createArticle',
	async (data: ArticleTypeType, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.post(`${authConfig.baseApiUrl}/article-types`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData(''));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const editArticleType = createAsyncThunk(
	`appArticleTypes/editArticle`,
	async (data: ArticleTypeType, { rejectWithValue, dispatch }: Redux) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const response = await axios.patch(`${authConfig.baseApiUrl}/article-types/${data.id}`, data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchData(''));

			return response;
		} catch (err: any) {
			return rejectWithValue(err);
		}
	}
);

export const appArticleTypesSlice = createSlice({
	name: 'appArticleTypes',
	initialState: { data: [] },
	reducers: {},
	extraReducers: builder => {
		builder.addCase(fetchData.fulfilled, (state, action) => {
			state.data = action.payload;
		});
	}
});

export default appArticleTypesSlice.reducer;

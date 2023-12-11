// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit';

// ** Reducers
import user from 'src/store/apps/user';
import earnings from 'src/store/apps/earnings';
import profile from 'src/store/apps/profile';
import tarif from 'src/store/apps/tarif';
import currencies from 'src/store/apps/currencies';
import networks from 'src/store/apps/network';
import transfers from 'src/store/apps/transfers';
import referrals from 'src/store/apps/referrals';
import wallets from 'src/store/apps/wallets';
import accountStatement from './apps/accountStatement';
import investment from './apps/investment';
import articles from './apps/articles';
import articleTypes from './apps/articleTypes';
import raffles from './apps/raffles';

export const store = configureStore({
	reducer: {
		accountStatement,
		user,
		earnings,
		profile,
		tarif,
		currencies,
		networks,
		transfers,
		referrals,
		wallets,
		investment,
		articles,
		articleTypes,
		raffles
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false
		})
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

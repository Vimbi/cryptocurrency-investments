// ** Next Import
import { GetServerSideProps, NextPage } from 'next/types';

// ** Third Party Imports
// import axios from 'axios'
import authConfig from 'src/configs/auth';
import * as cookie from 'cookie';

// ** Types

// ** Demo Components Imports
import UserViewPage from 'src/views/apps/user/view/UserViewPage';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { fetchUserData } from 'src/store/apps/user';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const UserView: NextPage = () => {
	const router = useRouter();
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.user);

	useEffect(() => {
		const uid = router.query.id;
		if (!store.user || (uid !== store.user.id && uid !== 'overview' && uid !== 'connection')) {
			fetchData(`${uid}`);
		}
		async function fetchData(id: string) {
			dispatch(fetchUserData(id)).then(result => {
				if (fetchUserData.rejected.match(result)) {
					router.push('/apps/user');
				}
			});
		}
	}, [dispatch, router.query.id, storedToken]);

	return <UserViewPage tab={'overview'} invoiceData={[]} />;
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

export default UserView;

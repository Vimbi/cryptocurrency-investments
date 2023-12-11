import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Grid } from '@mui/material';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { clearCard, fetchTransferById, fetchTransferStatuses } from 'src/store/apps/transfers';
import * as cookie from 'cookie';
import CardLayout from 'src/@core/components/card-layout';
import { AppDispatch, RootState } from 'src/store';
import TransferCardsAdmin from 'src/views/apps/transfers/TransferCardsAdmin';
import { TransferType } from 'src/types/apps/transfersType';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSettings } from 'src/@core/hooks/useSettings';

const TransfersCardAdmin: NextPage = () => {
	const dispatch = useDispatch<AppDispatch>();
	const {
		settings: { localeId }
	} = useSettings();
	const router = useRouter();

	const { transferCard } = useSelector((state: RootState) => state.transfers);

	const id = router.query?.id;

	useEffect(() => {
		return () => {
			dispatch(clearCard());
		};
	}, []);

	useEffect(() => {
		if (!!id && typeof id === 'string') {
			dispatch(fetchTransferById({ id, localeId }));
			dispatch(fetchTransferStatuses({ localeId }));
		}
	}, [id, localeId]);

	const handleOnReload = () => {
		if (!!id && typeof id === 'string') dispatch(fetchTransferById({ id, localeId }));
	};

	return (
		<CardLayout isLoaded={transferCard.isLoaded} data={transferCard.data} handleOnRedirect={() => router.back()}>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<TransferCardsAdmin
						transfer={transferCard.data as Required<TransferType>}
						onReload={handleOnReload}
					/>
				</Grid>
			</Grid>
		</CardLayout>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels', 'common'],
				null,
				['ru', 'en']
			))
		}
	};
};

export default TransfersCardAdmin;

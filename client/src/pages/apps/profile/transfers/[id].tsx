import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Box, Grid, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { clearCard, fetchTransferById } from 'src/store/apps/transfers';

import TransferCards from 'src/views/pages/profile/transfers/TransferCards';
import CardLayout from 'src/@core/components/card-layout';

import { AppDispatch, RootState } from 'src/store';
import { TransferType } from 'src/types/apps/transfersType';
import { fetchData } from 'src/store/apps/network';
import toast from 'react-hot-toast';
import * as cookie from 'cookie';

// ** Icon Imports
import Icon from 'src/@core/components/icon';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

const TransfersCard: NextPage = () => {
	const dispatch = useDispatch<AppDispatch>();
	const {
		settings: { localeId }
	} = useSettings();
	const router = useRouter();

	const { transferCard } = useSelector((state: RootState) => state.transfers);
	const network = useSelector((state: RootState) => state.networks.data);

	const id = router.query?.id;

	useEffect(() => {
		if (Boolean(router.query?.successWithdrawal)) {
			toast.success(
				t => (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Typography variant='body1'>
							<Translations text='successWithdrawal' locale='common' />
						</Typography>
						<IconButton size='small' onClick={() => toast.dismiss(t.id)}>
							<Icon icon='mdi:close' />
						</IconButton>
					</Box>
				),
				{
					duration: 60000,
					position: 'bottom-center'
				}
			);
		}

		return () => {
			dispatch(clearCard());
		};
	}, []);

	useEffect(() => {
		if (!!id && typeof id === 'string') {
			dispatch(fetchTransferById({ id, localeId }));
		}
	}, [id, localeId]);

	useEffect(() => {
		const currencyId = transferCard.data?.network.currencyId;

		if (!!currencyId) {
			dispatch(fetchData({ currencyId }));
		}
	}, [transferCard.data?.network.currencyId]);

	return (
		<CardLayout
			isLoaded={transferCard.isLoaded}
			data={transferCard.data}
			handleOnRedirect={() => router.push('/apps/profile/transfers')}
		>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<TransferCards networks={network} transfer={transferCard.data as Required<TransferType>} />
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
				['navigation', 'buttons', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

TransfersCard.acl = {
	subject: 'transfers',
	action: 'create'
};

export default TransfersCard;

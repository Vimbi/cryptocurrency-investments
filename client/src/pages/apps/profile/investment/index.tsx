import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Box, Button, Grid, Typography } from '@mui/material';
import Icon from 'src/@core/components/icon';

import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from 'src/store/apps/tarif';
import { AppDispatch, RootState } from 'src/store';
import { getBalance } from 'src/store/apps/accountStatement';
import { cancelInvestment, getCurrentInvestment } from 'src/store/apps/investment';

import CreateInvestModal from '../../../../views/pages/profile/invsetment/CreateInvestModal';
import InvestBalanceCard from 'src/views/pages/profile/invsetment/InvestBalanceCard';
import MyInvstmentCard from 'src/views/pages/profile/invsetment/MyInvstmentCard';
import MyTarif from 'src/views/pages/profile/tarrfs/MyTarif';
import CancelIvestModal from 'src/views/pages/profile/invsetment/CancelIvestModal';

// import AllIvestmentsCard from 'src/views/pages/profile/invsetment/AllIvestmentsCard/AllIvestmentsCard';

import * as cookie from 'cookie';
import { toast } from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next/types';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

const InvestActions = ({
	investingHidden,
	onInvestmentClick
}: {
	investingHidden: boolean;
	onInvestmentClick: () => void;
}) => {
	const router = useRouter();

	const handleOnRedirect = (url: string) => {
		router.push(url);
	};

	return (
		<>
			{!!investingHidden && (
				<Typography sx={{ mb: 4 }} variant='subtitle1'>
					<Translations text='FirstInvest' locale='investment' />
				</Typography>
			)}
			<Box
				sx={{
					display: 'grid',
					gridGap: 20,
					mb: 10,
					gridTemplateColumns: { sx: '1fr', md: 'repeat(3, fit-content(100%))' },
					alignItems: 'start'
				}}
			>
				{!investingHidden && (
					<Button
						variant='contained'
						sx={{
							width: { sx: '100%', md: 'fit-content' },
							display: 'flex',
							alignItems: 'center',
							'& svg': { mr: 3 }
						}}
						onClick={onInvestmentClick}
					>
						<Icon icon='mdi:cash-fast' fontSize={20} />
						<Translations text='Invest' locale='buttons' />
					</Button>
				)}

				<Button
					variant='outlined'
					onClick={() => handleOnRedirect('/apps/profile/create-deposit')}
					sx={{
						width: { sx: '100%', md: 'fit-content' },
						display: 'flex',
						alignItems: 'center',
						'& svg': { mr: 3 }
					}}
				>
					<Icon icon='mdi:wallet-plus' fontSize={20} />
					<Translations text='TopUp' locale='buttons' />
				</Button>
				<Button
					variant='outlined'
					onClick={() => handleOnRedirect('/apps/profile/create-withdrawal')}
					sx={{
						width: { sx: '100%', md: 'fit-content' },
						display: 'flex',
						alignItems: 'center',
						'& svg': { mr: 3 }
					}}
				>
					<Icon icon='mdi:bank-transfer-out' fontSize={20} />
					<Translations text='Withdrawal' locale='buttons' />
				</Button>
			</Box>
		</>
	);
};

const Investment: NextPage = () => {
	const {
		settings: { localeId }
	} = useSettings();
	const { t } = useTranslation('investment');
	const router = useRouter();
	const [showForm, setShowForm] = useState(false);
	const [openCancel, setOpenCancel] = useState(false);
	const dispatch = useDispatch<AppDispatch>();
	const { balance } = useSelector((state: RootState) => state.accountStatement);

	useEffect(() => {
		fetchBalanceData();
	}, [router.query]);

	useEffect(() => {
		if (localeId)
			dispatch(
				fetchData({
					limit: 10,
					page: 1,
					localeId
				})
			);
	}, [dispatch, localeId]);

	const fetchBalanceData = async () => {
		dispatch(getBalance());
		dispatch(getCurrentInvestment());
	};

	const handleCancelInvestment = async () => {
		dispatch(
			cancelInvestment({
				onSuccess: () => handleOnCancelStatus('success'),
				onError: () => handleOnCancelStatus('error')
			})
		);
	};

	const handleOnCancelStatus = (value: 'success' | 'error') => {
		if (value === 'success') {
			fetchBalanceData();
			toast.success(`${t('InvestCancelSuccess')}`, {
				position: 'bottom-center'
			});
		} else {
			toast.error(`${t('InvestCancelFailure')}`, {
				position: 'bottom-center'
			});
		}
		setOpenCancel(false);
	};

	return (
		<>
			<CreateInvestModal isNewInvestment={false} open={showForm} handleClose={setShowForm} />
			<CancelIvestModal open={openCancel} setOpen={setOpenCancel} onCancelIvestment={handleCancelInvestment} />
			<Grid container spacing={6}>
				<Grid item xs={12}>
					{/* {!!router.query?.all ? (
						<AllIvestmentsCard onToggleAll={toggleAll} />
					) : ( */}
					<MyInvstmentCard balance={balance} onCancel={() => setOpenCancel(true)} />
					{/*// )*/}
				</Grid>
				<Grid item xs={12}>
					<InvestBalanceCard
						content={InvestActions({
							investingHidden: !balance.invested,
							onInvestmentClick: () => setShowForm(true)
						})}
						onInvestmentClick={() => setShowForm(true)}
					/>
				</Grid>
				<Grid item xs={12}>
					<MyTarif />
				</Grid>
			</Grid>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'investment', 'labels', 'common'],
				null,
				['ru', 'en']
			))
		}
	};
};

Investment.acl = {
	subject: 'investment',
	action: 'read'
};

export default Investment;

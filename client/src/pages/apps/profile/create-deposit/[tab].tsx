import { NextPage } from 'next';

import { useEffect, useState } from 'react';

import { Grid, Typography, CardContent, Card, CardHeader } from '@mui/material';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';

// import { styled } from '@mui/material/styles';

import { useDispatch } from 'react-redux';

import { fetchData } from 'src/store/apps/currencies';
import { fetchData as fetchNetworks, setCurrentNetwork } from 'src/store/apps/network';

import { AppDispatch, RootState } from 'src/store';

import * as cookie from 'cookie';
import { useRouter } from 'next/router';

import DepositContent from 'src/views/pages/profile/create-deposit/depositContent';
import TabsCurrencies from 'src/views/components/tabs/TabsCurrencies';
import { NetworkType } from 'src/types/apps/networkType';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import TabsNetworks from 'src/views/components/tabs/TabsNetworks';
import { useSelector } from 'react-redux';

const CreateDeposit: NextPage = () => {
	const dispatch = useDispatch<AppDispatch>();

	const router = useRouter();

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const selectedNetwork = useSelector((state: RootState) => state.networks.currentNetwork);

	const handleGetNetwork = async () => {
		const res = await dispatch(fetchNetworks({ currencyId: router.query.tab as string }));
		if (!!res.payload && res.payload.length > 0) {
			const networks = res.payload;

			const currentNetwork = networks.find((net: NetworkType) => net.currencyId === (router.query.tab as string));
			dispatch(setCurrentNetwork(currentNetwork));
		} else {
			dispatch(setCurrentNetwork(null));
		}
	};

	useEffect(() => {
		handleGetNetwork();
	}, [router.query.tab]);

	useEffect(() => {
		dispatch(fetchData());
	}, []);

	const selectedCurrency = router.query.tab;

	const handleOnSetActiveCurrency = (id: string) => {
		setIsLoading(true);
		router.push(`/apps/profile/create-deposit/${id}`).then(() => setIsLoading(false));
	};

  const handleOnSetActiveNetwork = (network: NetworkType) => {
		dispatch(setCurrentNetwork(network));
  }

	return (
		<DatePickerWrapper>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<Card>
						<CardHeader
							title={
								<Typography variant='h5'>
									<Translations text='Replenishment' locale='navigation' />
								</Typography>
							}
						/>
					</Card>
				</Grid>
				<Grid item xs={12}>
					<Card>
						<CardContent>
				      <Typography variant='h6'>
                <Translations text="Currencies" locale='navigation' />
              </Typography>
							<TabsCurrencies
								activeCurrency={selectedCurrency as string}
								setActiveCurrency={handleOnSetActiveCurrency}
							/>
				      <Typography style={{marginTop: 15}} variant='h6'>
                <Translations text="Networks" locale='navigation' />
              </Typography>
              <TabsNetworks
                activeNetwork={selectedNetwork as NetworkType}
                setActiveNetwork={handleOnSetActiveNetwork}
              />
							<DepositContent isLoading={isLoading} activeCurrency={selectedCurrency as string} activeNetwork={selectedNetwork?.id} />
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</DatePickerWrapper>
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

CreateDeposit.acl = {
	subject: 'transfers',
	action: 'create'
};

export default CreateDeposit;

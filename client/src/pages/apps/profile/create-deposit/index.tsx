import { NextPage } from 'next';

import { useEffect } from 'react';

import { Grid, Typography, CardContent, Card, CardHeader } from '@mui/material';

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';

import { useDispatch } from 'react-redux';

import { fetchData } from 'src/store/apps/currencies';
import { fetchData as fetchNetworks } from 'src/store/apps/network';

import { AppDispatch, RootState } from 'src/store';
import * as cookie from 'cookie';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import SelectCurrency from 'src/views/apps/currencies/SelectCurrencies';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';

const CreateDeposit: NextPage = () => {
	const { data } = useSelector((state: RootState) => state.currencies);
	const networks = useSelector((state: RootState) => state.networks.data);

	const dispatch = useDispatch<AppDispatch>();

	const router = useRouter();

	useEffect(() => {
		dispatch(fetchData());
		dispatch(fetchNetworks({}));
	}, []);

	const handleOnSetActiveCurrency = (id: string) => {
		router.push(`/apps/profile/create-deposit/${id}`);
	};

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
							{data && data.length && (
								<SelectCurrency
									data={data}
									networks={networks}
									selectCurrency={handleOnSetActiveCurrency}
								/>
							)}
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
	action: 'read'
};

export default CreateDeposit;

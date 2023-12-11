import { NextPage } from 'next';
import { GetServerSideProps } from 'next/types';
import { useEffect } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import InvestBalanceCard from 'src/views/pages/profile/invsetment/InvestBalanceCard';

import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { fetchData } from 'src/store/apps/currencies';
import { getBalance } from 'src/store/apps/accountStatement';
import * as cookie from 'cookie';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import Translations from 'src/layouts/components/Translations';
import TransitTransferContent from 'src/views/pages/profile/transit-transfer/TransitTransferContent';

const TransferTransit: NextPage = () => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		dispatch(fetchData());
		dispatch(getBalance());
	}, []);

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader
						title={
							<Typography variant='h5'>
								<Translations text='TransferToUser' locale='navigation' />
							</Typography>
						}
					/>
				</Card>
			</Grid>
			<Grid item xs={12}>
				<InvestBalanceCard headHidden={true} />
			</Grid>
			<Grid item xs={12}>
				<Card>
					<CardContent>
						<TransitTransferContent />
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'common', 'labels', 'investment'],
				null,
				['ru', 'en']
			))
		}
	};
};

TransferTransit.acl = {
	subject: 'transfers',
	action: 'create'
};

export default TransferTransit;

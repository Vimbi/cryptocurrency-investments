import { NextPage } from 'next';

import { Grid, Card, CardHeader, Tab } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';

import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import AdminTransfersTab from 'src/views/pages/admin/transfers/TransfersTab';
import { SyntheticEvent, useState } from 'react';
import AdminTransactionsTab from 'src/views/pages/admin/transactions/TransactionsTab';

const Transfers: NextPage = () => {
	const [tab, setTab] = useState<string>('transfers');
	const handleTab = (event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	return (
		<TabContext value={tab}>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<Card>
						<CardHeader
							title={
								<TabList onChange={handleTab}>
									<Tab
										value='transfers'
										label={<Translations text='history.tab1' locale='common' />}
									/>
									<Tab
										value='transactions'
										label={<Translations text='history.tab2' locale='common' />}
									/>
								</TabList>
							}
						/>

						<TabPanel value='transfers' sx={{ p: 0 }}>
							<AdminTransfersTab />
						</TabPanel>
						<TabPanel value='transactions' sx={{ p: 0 }}>
							<AdminTransactionsTab />
						</TabPanel>
					</Card>
				</Grid>
			</Grid>
		</TabContext>
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

Transfers.acl = {
	subject: 'transfers_admin',
	action: 'read'
};

export default Transfers;

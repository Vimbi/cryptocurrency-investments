import { NextPage } from 'next';

import { CardHeader, Grid, Card } from '@mui/material';

import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';

import { SyntheticEvent, useState } from 'react';

import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import en from 'date-fns/locale/en-GB';

import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import TransferTab from 'src/views/pages/profile/transfers/TransferHistoryTab';
import TransactionTab from 'src/views/pages/profile/transfers/TransferTransactionTab';

registerLocale('ru', ru);
registerLocale('en', en);

const Transfers: NextPage = () => {
	const [tab, setTab] = useState<string>('transfers');
	const handleTab = (event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	return (
		<TabContext value={tab}>
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<DatePickerWrapper>
						<Card>
							<CardHeader
								title={
									<Grid container>
										<Grid item xs={12}>
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
										</Grid>
									</Grid>
								}
							/>
							<TabPanel sx={{ p: 0 }} value='transfers'>
								<TransferTab />
							</TabPanel>
							<TabPanel sx={{ p: 0 }} value='transactions'>
								<TransactionTab />
							</TabPanel>
						</Card>
					</DatePickerWrapper>
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
				['navigation', 'main', 'buttons', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

Transfers.acl = {
	subject: 'transfers',
	action: 'read'
};

export default Transfers;

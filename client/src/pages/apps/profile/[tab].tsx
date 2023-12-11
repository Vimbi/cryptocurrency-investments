import { NextPage } from 'next';

import Grid from '@mui/material/Grid';
import { Divider, Typography } from '@mui/material';

import PageHeader from 'src/@core/components/page-header';
import AccountSettings from 'src/views/pages/profile/user/AccountSettings';
import { GetServerSideProps } from 'next/types';
import { PricingPlanType } from 'src/@core/components/plan-details/types';
import * as cookie from 'cookie';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';

type TabsTipe = 'account' | 'security' | 'wallets';

const Profile: NextPage<{ tab: TabsTipe; apiPricingPlanData: PricingPlanType[] }> = ({ tab, apiPricingPlanData }) => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<PageHeader
					title={
						<Typography variant='h5'>
							<Translations text='Profile' locale='navigation' />
						</Typography>
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Divider sx={{ my: '0 !important' }} />
			</Grid>
			<Grid item xs={12}>
				<AccountSettings tab={tab} apiPricingPlanData={apiPricingPlanData} />
			</Grid>
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;
	const pricingPlans: PricingPlanType[] = [
		{
			title: '',
			imgSrc: '',
			subtitle: '',
			imgWidth: 1,
			imgHeight: 1,
			currentPlan: true,
			popularPlan: true,
			price: 1,
			planBenefits: ['test'],
			yearlyPlan: {
				perMonth: 1,
				totalAnnual: 1
			}
		}
	];

	return {
		props: {
			tab: context?.query?.tab,
			apiPricingPlanData: pricingPlans,
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels', 'common'],
				null,
				['ru', 'en']
			))
		}
	};
};

Profile.acl = {
	subject: 'profile',
	action: 'manage'
};

export default Profile;

import { NextPage } from 'next';
import { Typography, Grid, Card, CardHeader } from '@mui/material';
import * as cookie from 'cookie';
import TeamSettings from 'src/views/pages/profile/team/TeamSettings';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import ReferralCard from 'src/views/pages/profile/team/card/ReferralCard';

const Team: NextPage = () => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader
						title={
							<Typography variant='h5'>
								<Translations text='MyTeam' locale='navigation' />
							</Typography>
						}
						action={<ReferralCard />}
					/>
				</Card>
			</Grid>
			<Grid item xs={12}>
				<TeamSettings />
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
				['navigation', 'buttons', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

Team.acl = {
	subject: 'team',
	action: 'read'
};

export default Team;

import { GetServerSideProps } from 'next/types';
import { NextPage } from 'next';
import { ReactNode } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { Box, Typography, Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import authConfig from 'src/configs/auth';
import { ReferralType } from 'src/types/apps/referralType';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import * as cookie from 'cookie';

const ReferralLevels: NextPage<{ data: ReferralType[] }> = ({ data }) => {
	const { t } = useTranslation('labels');
	const columns: GridColDef[] = [
		{ field: 'level', headerName: `${t('levels')}`, flex: 0.5 },
		{
			flex: 0.5,
			field: 'percentage',
			headerName: '%',
			renderCell: ({ row }: { row: ReferralType }) => (
				<Typography
					sx={{ fontStyle: row.status ? 'normal' : 'italic' }}
					variant={row.status ? 'body1' : 'caption'}
				>
					{row.status ? row.percentage : 0}
				</Typography>
			)
		}
	];

	return (
		<>
			<Typography sx={{ mt: 8 }} fontWeight='bold' variant='h3'>
				<Translations text='ReferralProgram' locale='navigation' />
			</Typography>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
					alignItems: 'center',
					gridGap: 20,
					mt: { xs: 5, sm: 10, md: 8 }
				}}
			>
				<Box sx={{ width: '100%' }}>
					<Card>
						<DataGrid
							paginationMode='server'
							columns={columns}
							autoHeight
							disableColumnFilter={true}
							disableColumnMenu={true}
							disableColumnSelector={true}
							hideFooter={true}
							rows={data}
						/>
					</Card>
				</Box>

				<Typography
					sx={{ gridRow: { xs: 1, sm: 'auto' }, width: '100%', whiteSpace: 'pre-wrap' }}
					variant='body1'
				>
					<Translations text='ReferralProgramDescription' locale='common' />
				</Typography>
			</Box>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<{ data: ReferralType[] }> = async (context: any) => {
	const res = await fetch(`${authConfig.baseApiUrl}/referral-levels`);
	const resData = await res.json();
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			data: resData,
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

ReferralLevels.guestGuard = true;
ReferralLevels.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default ReferralLevels;

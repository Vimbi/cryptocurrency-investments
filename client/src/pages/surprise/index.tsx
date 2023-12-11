import { Box, Typography, Tab, Pagination } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { TabPanel, TabContext } from '@mui/lab';
import { styled } from '@mui/material/styles';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';
import { useState, SyntheticEvent } from 'react';
import { SurpriseCard } from 'src/views/ui/surprise-card/ui';
import { NextPage } from 'next';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { RaffleType } from 'src/types/apps/raffleTypes';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import * as cookie from 'cookie';
import { useSettings } from 'src/@core/hooks/useSettings';

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
	'& .MuiTabs-indicator': {
		display: 'none'
	},
	'& .Mui-selected': {
		backgroundColor: theme.palette.primary.main,
		color: `${theme.palette.primary.contrastText} !important`
	},
	'& .MuiTab-root': {
		minHeight: 42,
		minWidth: 114,
		borderRadius: '9999px'
	}
}));

const Surprise: NextPage = () => {
	const { t } = useTranslation('common');
	const {
		settings: { localeId, mode }
	} = useSettings();

	const [value, setValue] = useState<string>('false');
	const [data, setData] = useState<RaffleType[] | null>();
	const [page, setPage] = useState(1);
	const [itemCount, setItemCount] = useState(3);

	const handleGetData = async () => {
		try {
			const res = await axios.get(`${authConfig.baseApiUrl}/raffles`, {
				params: { isCompleted: value, page, localeId, theme: mode }
			});
			setData(res.data.entities);
			setItemCount(res.data.itemCount);
		} catch (e) {}
	};
	const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};
	const handleChangeTab = (event: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};
	useEffect(() => {
		if (value && page && mode && localeId) handleGetData();
	}, [value, page, mode, localeId]);

	return (
		<>
			<TabContext value={value}>
				<Box
					sx={{
						mt: 8,
						display: { sm: 'flex', xs: 'grid' },
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 8,
						gridTemplateColumns: '1fr',
						gap: { sm: 0, xs: 4 }
					}}
				>
					<Typography fontWeight='bold' variant='h3'>
						<Translations text='Raffles' locale='navigation' />
					</Typography>
					{!(itemCount / 3 <= 1) && (
						<Pagination color='primary' size='large' count={itemCount / 3} onChange={handleChangePage} />
					)}
					<TabList onChange={handleChangeTab} aria-label='customized tabs example'>
						<Tab value='false' label={t('Current')} />
						<Tab value='true' label={t('Passed')} />
					</TabList>
				</Box>

				<TabPanel value='false'>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
						{data?.map(item => (
							<SurpriseCard key={item.id} data={item} />
						))}{' '}
					</Box>
				</TabPanel>
				<TabPanel value='true'>
					{data?.map(item => (
						<SurpriseCard key={item.id} data={item} />
					))}
				</TabPanel>
			</TabContext>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(lang ?? context.locale, ['navigation', 'footer', 'common'], null, [
				'ru',
				'en'
			]))
		}
	};
};

Surprise.guestGuard = true;
Surprise.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default Surprise;

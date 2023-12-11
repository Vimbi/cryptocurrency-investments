// ** React Imports
import { ReactElement, useState, useEffect, SyntheticEvent } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** MUI Imports
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Typography from '@mui/material/Typography';
import { styled, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';
import CircularProgress from '@mui/material/CircularProgress';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Types
import { PricingPlanType } from 'src/@core/components/plan-details/types';

// ** Demo Tabs Imports
import TabAccount from 'src/views/pages/profile/user/TabAccount';
import TabSecurity from 'src/views/pages/profile/user/TabSecurity';

import { AppDispatch } from 'src/store';

import { useDispatch } from 'react-redux';
import { fetchProfileData } from 'src/store/apps/profile';
import TabWallet from './TabWallets';
import Translations from 'src/layouts/components/Translations';

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
	'& .MuiTabs-indicator': {
		display: 'none'
	},
	'& .Mui-selected': {
		backgroundColor: theme.palette.primary.main,
		color: `${theme.palette.primary.contrastText} !important`
	},
	'& .MuiTab-root': {
		minWidth: 65,
		minHeight: 40,
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		borderRadius: theme.shape.borderRadius,
		[theme.breakpoints.up('md')]: {
			minWidth: 130
		}
	}
}));

const AccountSettings = ({ tab }: { tab: string; apiPricingPlanData: PricingPlanType[] }) => {
	const dispatch = useDispatch<AppDispatch>();

	// ** State
	const [activeTab, setActiveTab] = useState<string>(tab);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// ** Hooks
	const router = useRouter();
	const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

	const handleChange = (event: SyntheticEvent, value: string) => {
		setIsLoading(true);
		router.push(`/apps/profile/${value.toLowerCase()}`).then(() => setIsLoading(false));
	};

	useEffect(() => {
		dispatch(fetchProfileData());
	}, []);

	useEffect(() => {
		if (tab && tab !== activeTab) {
			setActiveTab(tab);
		}
	}, [tab]);

	const tabContentList: { [key: string]: ReactElement } = {
		account: <TabAccount />,
		security: <TabSecurity />,
		wallets: <TabWallet />
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<TabContext value={activeTab}>
					<Grid container spacing={6}>
						<Grid item xs={12}>
							<TabList
								variant='scrollable'
								scrollButtons='auto'
								onChange={handleChange}
								aria-label='customized tabs example'
							>
								<Tab
									value='account'
									label={
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												...(!hideText && { '& svg': { mr: 2 } })
											}}
										>
											<Icon icon='mdi:account-outline' />
											{!hideText && <Translations text='account' locale='labels' />}
										</Box>
									}
								/>
								<Tab
									value='security'
									label={
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												...(!hideText && { '& svg': { mr: 2 } })
											}}
										>
											<Icon icon='mdi:lock-open-outline' />
											{!hideText && <Translations text='security' locale='labels' />}
										</Box>
									}
								/>
								<Tab
									value='wallets'
									label={
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												...(!hideText && { '& svg': { mr: 2 } })
											}}
										>
											<Icon icon='mdi:wallet' />
											{!hideText && <Translations text='wallets' locale='labels' />}
										</Box>
									}
								/>
								{/* <Tab
									value='billing'
									label={
										<Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
											<Icon icon='mdi:bookmark-outline' />
											{!hideText && 'Способы оплаты'}
										</Box>
									}
								/>
								<Tab
									value='notifications'
									label={
										<Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
											<Icon icon='mdi:bell-outline' />
											{!hideText && 'Оповещения'}
										</Box>
									}
								/>
								<Tab
									value='connections'
									label={
										<Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
											<Icon icon='mdi:link' />
											{!hideText && 'Подключённые аккаунты'}
										</Box>
									}
								/> */}
							</TabList>
						</Grid>
						<Grid item xs={12} sx={{ pt: theme => `${theme.spacing(4)} !important` }}>
							{isLoading ? (
								<Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
									<CircularProgress sx={{ mb: 4 }} />
									<Typography>
										<Translations text='loading' locale='common' />
									</Typography>
								</Box>
							) : (
								<TabPanel sx={{ p: 0 }} value={activeTab}>
									{tabContentList[activeTab]}
								</TabPanel>
							)}
						</Grid>
					</Grid>
				</TabContext>
			</Grid>
		</Grid>
	);
};

export default AccountSettings;

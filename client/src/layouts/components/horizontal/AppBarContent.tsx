// ** MUI Imports
import Box from '@mui/material/Box';

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext';

// ** Components
// import Autocomplete from 'src/layouts/components/Autocomplete';
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown';
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler';
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown';

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth';

interface Props {
	hidden: boolean;
	settings: Settings;
	saveSettings: (values: Settings) => void;
}

// const shortcuts: ShortcutsType[] = [
// 	{
// 		title: 'Calendar',
// 		url: '/apps/calendar',
// 		subtitle: 'Appointments',
// 		icon: 'mdi:calendar-month-outline'
// 	},
// 	{
// 		title: 'Invoice App',
// 		url: '/apps/invoice/list',
// 		subtitle: 'Manage Accounts',
// 		icon: 'mdi:receipt-text-outline'
// 	},
// 	{
// 		title: 'Users',
// 		url: '/apps/user/list',
// 		subtitle: 'Manage Users',
// 		icon: 'mdi:account-outline'
// 	},
// 	{
// 		url: '/apps/roles',
// 		title: 'Role Management',
// 		subtitle: 'Permissions',
// 		icon: 'mdi:shield-check-outline'
// 	},
// 	{
// 		url: '/',
// 		title: 'Dashboard',
// 		icon: 'mdi:chart-pie',
// 		subtitle: 'User Dashboard'
// 	},
// 	{
// 		title: 'Settings',
// 		icon: 'mdi:cog-outline',
// 		subtitle: 'Account Settings',
// 		url: '/pages/account-settings/account'
// 	},
// 	{
// 		title: 'Help Center',
// 		subtitle: 'FAQs & Articles',
// 		icon: 'mdi:help-circle-outline',
// 		url: '/pages/help-center'
// 	},
// 	{
// 		title: 'Dialogs',
// 		subtitle: 'Useful Dialogs',
// 		icon: 'mdi:window-maximize',
// 		url: '/pages/dialog-examples'
// 	}
// ];

const AppBarContent = (props: Props) => {
	// ** Props
	const { settings, saveSettings } = props;

	// ** Hook
	const auth = useAuth();

	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			{/* {auth.user && <Autocomplete hidden={hidden} settings={settings} />} */}

			{auth.user && (
				<>
					{/* <ShortcutsDropdown settings={settings} shortcuts={shortcuts} /> */}
					{/* <NotificationDropdown settings={settings} notifications={notifications} /> */}
					<UserDropdown user={auth.user} settings={settings}>
						<LanguageDropdown settings={settings} saveSettings={saveSettings} />
						<ModeToggler settings={settings} saveSettings={saveSettings} />
					</UserDropdown>
				</>
			)}
		</Box>
	);
};

export default AppBarContent;

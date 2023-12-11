// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ** Icon Imports
// import Icon from 'src/@core/components/icon';

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext';

// ** Components
// import BurgerNavigationToggler from 'src/@core/layouts/components/shared-components/BurgerNavigationToggler';

import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler';
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown';
import { useAuth } from 'src/hooks/useAuth';
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown';
import { IconButton } from '@mui/material';
import IconifyIcon from 'src/@core/components/icon';
import Translations from '../Translations';

interface Props {
	hidden: boolean;
	settings: Settings;
	toggleNavVisibility: () => void;
	saveSettings: (values: Settings) => void;
	navVisible: boolean;
}

const AppBarContent = (props: Props) => {
	// ** Props
	const { toggleNavVisibility, navVisible, hidden, settings, saveSettings } = props;

	// ** Hooks
	const router = useRouter();

	const auth = useAuth();

	return (
		<Box sx={{ width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			{!hidden ? (
				<>
					<Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
						<LanguageDropdown settings={settings} saveSettings={saveSettings} />
						<ModeToggler settings={settings} saveSettings={saveSettings} />
						<IconButton onClick={toggleNavVisibility} color='inherit'>
							{navVisible ? <IconifyIcon icon='mdi:close' /> : <IconifyIcon icon='mdi:menu' />}
						</IconButton>
					</Box>

					<Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
						{auth?.user ? (
							<UserDropdown user={auth.user} settings={settings} />
						) : (
							<Button
								variant='contained'
								sx={{ whiteSpace: 'nowrap' }}
								onClick={() => router.push('/login')}
							>
								<Translations text='SignIn' locale='buttons' />
							</Button>
						)}
					</Box>
				</>
			) : (
				<>
					<LanguageDropdown settings={settings} saveSettings={saveSettings} />
					<ModeToggler settings={settings} saveSettings={saveSettings} />
					<IconButton onClick={toggleNavVisibility} color='inherit'>
						{navVisible ? <IconifyIcon icon='mdi:close' /> : <IconifyIcon icon='mdi:menu' />}
					</IconButton>
				</>
			)}
		</Box>
	);
};

export default AppBarContent;

// ** Next Imports
import { useRouter } from 'next/router';

// ** MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ** Icon Imports// ** Type Import
import { Settings } from 'src/@core/context/settingsContext';
import { useAuth } from 'src/hooks/useAuth';
import getHomeRoute from '../acl/getHomeRoute';
import { FC } from 'react';
import Translations from '../Translations';

interface Props {
	settings: Settings;
	saveSettings: (values: Settings) => void;
}

const AfterNavigationContent: FC<Props> = () => {
	// ** Hooks
	const router = useRouter();
	const auth = useAuth();

	return (
		<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
			<Box className='actions-right' sx={{ px: 4, display: 'flex', alignItems: 'center', width: '100%' }}>
				{auth?.user ? (
					<Button
						fullWidth
						variant='contained'
						onClick={() => router.push(getHomeRoute(auth.user?.role?.name as string))}
					>
						<Translations text='PersonalAccount' locale='buttons' />
					</Button>
				) : (
					<Button fullWidth variant='contained' onClick={() => router.push('/login')}>
						<Translations text='SignIn' locale='buttons' />
					</Button>
				)}
			</Box>
		</Box>
	);
};

export default AfterNavigationContent;

// ** React Imports
import { useSelector } from 'react-redux';

// ** MUI Imports
import Grid from '@mui/material/Grid';

// ** Icon Imports

// ** Custom Components Imports

// ** Demo Components
import ChangePasswordCard from 'src/views/pages/profile/user/security/ChangePasswordCard';
import ChangeEmailCard from 'src/views/pages/profile/user/security/ChangeEmailCard';
import TwoFactorAuthenticationCard from './security/TwoFactorAuthentication';
import { RootState } from 'src/store';

const TabSecurity = () => {
	const { profile } = useSelector((state: RootState) => state.profile);

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<ChangePasswordCard />
			</Grid>
			<Grid item xs={12}>
				<ChangeEmailCard />
			</Grid>
			<Grid item xs={12}>
				<TwoFactorAuthenticationCard isEnabled={profile?.isTwoFactorAuthenticationEnabled || false} />
			</Grid>
		</Grid>
	);
};
export default TabSecurity;

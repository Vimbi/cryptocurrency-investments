// ** MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

const UserViewOverview = () => {
	const userData = useSelector((state: RootState) => state.user.user);

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader title='О пользователе' />
					<CardContent>{userData?.description}</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export default UserViewOverview;

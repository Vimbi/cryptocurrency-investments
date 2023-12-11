import { FC } from 'react';
import { Grid } from '@mui/material';
import TeamReferalLink from './referal/ReferalLink';
import TeamTable from './table/TeamTable';

const TeamSettings: FC = () => {
	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<TeamReferalLink />
			</Grid>
			<Grid item xs={12}>
				<TeamTable />
			</Grid>
		</Grid>
	);
};

export default TeamSettings;

import { FC } from 'react';

import { Grid, Box, CircularProgress, Typography } from '@mui/material';

import DepositForm from './depositForm';
import CurrentCourse from 'src/views/apps/currencies/CurrentCourse';
import Translations from 'src/layouts/components/Translations';

type DepositContentProps = {
	isLoading: boolean;
	activeCurrency: string;
	activeNetwork: string | undefined;
};

const DepositContent: FC<DepositContentProps> = ({ isLoading, activeCurrency, activeNetwork }) => {
	return (
		<div>
			{isLoading && !activeCurrency ? (
				<Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
					<CircularProgress sx={{ mb: 4 }} />
					<Typography>
						<Translations text='loading' locale='common' />
					</Typography>
				</Box>
			) : (
				<Grid container spacing={5} mt={5}>
					<Grid item xs={12} sm={6}>
						<DepositForm activeCurrency={activeCurrency} />
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
						sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
					>
						<CurrentCourse activeNetwork={activeNetwork} />
					</Grid>
				</Grid>
			)}
		</div>
	);
};

export default DepositContent;

import { FC } from 'react';

import { Box, CircularProgress, Typography } from '@mui/material';

import { CardLayoutProps } from './types';
import Translations from 'src/layouts/components/Translations';

const CardLayout: FC<CardLayoutProps> = ({ isLoaded, data, children, handleOnRedirect }) => {
	if (!isLoaded && !data) {
		<Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
			<CircularProgress sx={{ mb: 4 }} />
			<Typography>
				<Translations text='loading' locale='common' />
			</Typography>
		</Box>;
	}

	if (isLoaded && !data) {
		if (handleOnRedirect) handleOnRedirect();
	}

	if (isLoaded && data && Object.keys(data).length > 0) {
		return <>{children}</>;
	}

	return (
		<Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
			<CircularProgress sx={{ mb: 4 }} />
			<Typography>
				<Translations text='loading' locale='common' />
			</Typography>
		</Box>
	);
};

export default CardLayout;

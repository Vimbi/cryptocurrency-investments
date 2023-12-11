import { Box, Grid } from '@mui/material';
import TransitTransferForm from './TransitTransferForm';

const TransitTransferContent = () => {
	return (
		<Box>
			<Grid container>
				<Grid item md={6} xs={12}>
					<TransitTransferForm />
				</Grid>
			</Grid>
		</Box>
	);
};

export default TransitTransferContent;

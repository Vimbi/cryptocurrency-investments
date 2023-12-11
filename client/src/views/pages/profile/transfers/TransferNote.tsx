import { FC } from 'react';

import { Grid, TextField, Card, CardContent } from '@mui/material';

type TransferNoteProps = {
	note: string;
};

const TransferNote: FC<TransferNoteProps> = ({ note }) => {
	return (
		<Card>
			<CardContent>
				<Grid container spacing={6}>
					<Grid item xs={12}>
						<TextField fullWidth value={note} disabled />
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default TransferNote;

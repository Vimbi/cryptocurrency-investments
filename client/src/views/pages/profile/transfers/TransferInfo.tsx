import { FC } from 'react';

import { Grid, TextField, Card, CardContent } from '@mui/material';
import { formatDate } from 'src/@core/utils/format';
import Translations from 'src/layouts/components/Translations';

type TransferInfoData = {
	createdAt: string;
	endedAt: string;
	updatedAt: string | null;
};

type TransferInfoProps = {
	info: TransferInfoData;
};

const TransferInfo: FC<TransferInfoProps> = ({ info }) => {
	const getDateValue = (value: string | Date | null) => {
		if (!value) return '-';

		return formatDate(value);
	};

	return (
		<Card>
			<CardContent>
				<Grid container spacing={6}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='standard'
							InputProps={{ readOnly: true }}
							value={getDateValue(info.createdAt)}
							label={<Translations text='createdAt' locale='labels' />}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='standard'
							InputProps={{ readOnly: true }}
							value={getDateValue(info.updatedAt)}
							label={<Translations text='updatedAt' locale='labels' />}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='standard'
							InputProps={{ readOnly: true }}
							value={getDateValue(info.endedAt)}
							label={<Translations text='endedAt' locale='labels' />}
						/>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};

export default TransferInfo;

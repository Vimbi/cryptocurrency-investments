import { FC } from 'react';

import {
	Card,
	CardContent,
	Grid,
	TextField,
	OutlinedInput,
	InputLabel,
	FormControl,
	InputAdornment,
	IconButton
} from '@mui/material';

import Icon from 'src/@core/components/icon';

import { toast } from 'react-hot-toast';

import useClipboard from 'src/@core/hooks/useClipboard';

import { TransferTypesType } from 'src/types/apps/transfersType';
import Translations from 'src/layouts/components/Translations';
import { NetworkType } from 'src/types/apps/networkType';

type OperationData = {
	type: TransferTypesType;
	amount: number | string;
	network: NetworkType;
	currencyAmount: number | string;
	withdrawalAddress: string | null;
  fromAddress: string | null;
};

type TransferOperationProps = {
	operation: OperationData;
};

const TransferOperation: FC<TransferOperationProps> = ({ operation }) => {
	const amountType = operation.type.localeContent[0]?.displayName ?? operation.type.displayName;

	const clipboard = useClipboard({
		onSuccess() {
			toast.success(<Translations text='copied' locale='labels' />, {
				position: 'top-right',
				duration: 1000
			});
		}
	});

  const address = {
    label: !!operation.withdrawalAddress ? 'walletAddress' : 'walletFromAddress',
    value: !!operation.withdrawalAddress ? operation.withdrawalAddress : operation.fromAddress
  }

	return (
		<Card>
			<CardContent>
				<Grid container spacing={6}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='outlined'
							InputProps={{ readOnly: true }}
							value={operation.amount + '($)'}
							label={amountType}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='outlined'
							InputProps={{ readOnly: true }}
							value={operation.currencyAmount + `(${operation.network?.currency?.symbol})`}
							label={operation.network?.currency?.displayName}
						/>
					</Grid>
					{(!!operation.withdrawalAddress || !!operation.fromAddress) && (
						<Grid item xs={12}>
							<FormControl fullWidth>
								<InputLabel htmlFor='withdrawal_address'>
									<Translations text={address.label} locale='labels' />
								</InputLabel>
								<OutlinedInput
									id='withdrawal_address'
									fullWidth
									readOnly
									value={address.value}
									label={<Translations text={address.label} locale='labels' />}
									endAdornment={
										<InputAdornment position='end'>
											<IconButton
												onClick={() => clipboard.copy(address.value)}
												size='medium'
												color='secondary'
											>
												<Icon icon='mdi:content-copy' />
											</IconButton>
										</InputAdornment>
									}
								/>
							</FormControl>
						</Grid>
					)}
				</Grid>
			</CardContent>
		</Card>
	);
};

export default TransferOperation;

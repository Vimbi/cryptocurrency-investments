import { FC } from 'react';

import { Grid, Card, CardHeader, Button, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import Chip from 'src/@core/components/mui/chip';
import Icon from 'src/@core/components/icon';

import TransferInfo from './TransferInfo';
import TransferTxid from './TransferTxid';
import TransferOperation from './TransferOperation';

import { useRouter } from 'next/router';

import { TransferStatusesType, TransferType } from 'src/types/apps/transfersType';
import TransferNote from './TransferNote';
import { NetworkType } from 'src/types/apps/networkType';
import useClipboard from 'src/@core/hooks/useClipboard';
import toast from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';

const statuses: any = {
	pending: {
		icon: 'mdi:receipt-text-clock',
		color: 'warning',
		correctSpelling: 'pending',
		label: <Translations text='transferStatuses.pending' locale='labels' />
	},
	completed: {
		icon: 'mdi:star',
		color: 'success',
		correctSpelling: 'complete',
		label: <Translations text='transferStatuses.completed' locale='labels' />
	},
	processed: {
		icon: 'mdi:publish',
		color: 'info',
		correctSpelling: 'publish',
		label: <Translations text='transferStatuses.processed' locale='labels' />
	},
	canceled: {
		icon: 'mdi:cancel',
		color: 'error',
		correctSpelling: 'cancel',
		label: <Translations text='transferStatuses.canceled' locale='labels' />
	}
};

const TransferStatus = ({ status }: { status: Required<TransferStatusesType> }) => {
	const statusObj = statuses[status.name];
	const loc = status.localeContent[0]?.displayName;

	return (
		<Chip
			icon={<Icon icon={statusObj.icon} />}
			skin='light'
			size='medium'
			label={loc ?? statusObj.label}
			color={statusObj.color}
			sx={{ textTransform: 'capitalize', pl: 1 }}
		/>
	);
};

type TransferCardProps = {
	transfer: Required<TransferType>;
	networks: NetworkType[];
};

const TransferCards: FC<TransferCardProps> = ({ transfer, networks }) => {
	const router = useRouter();
	const clipboard = useClipboard();

	const type = transfer.type.localeContent[0]?.displayName;

	const handleCopy = (text: string | undefined | null) => {
		if (text) {
			clipboard.copy(text);
			toast.success(<Translations text='copied' locale='labels' />);
		}
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Grid container alignItems='center' spacing={2}>
					<Grid item height={48}>
						<Button
							onClick={() => router.push('/apps/profile/transfers')}
							variant='contained'
							color='primary'
							startIcon={<Icon icon='mdi:backburger' />}
						>
							<Translations text='Back' locale='buttons' />
						</Button>
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Card>
					<CardHeader title={type} action={<TransferStatus status={transfer.status} />} />
				</Card>
			</Grid>
			{(transfer.status.name === 'pending' || transfer.txId) && transfer.type.name !== 'withdrawal' && (
				<>
					<Grid item xs={12}>
						{networks.length === 0 ? (
							<Card>
								<CardContent>
									<Typography>
										<Translations text='NoTransferOptionExtended' locale='common' />
									</Typography>
								</CardContent>
							</Card>
						) : (
							<Card>
								<CardHeader title={<Translations text='Steps.1' locale='common' />} />
								<CardContent>
									<Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
										<Translations text='Transfer' locale='common' />
										<span style={{ fontWeight: 700 }}>{` ${transfer.currencyAmount} `}</span>
										{transfer.network?.currency?.symbol} <Translations text='on' locale='labels' />{' '}
										<span style={{ textTransform: 'lowercase' }}>
                      <Translations text='walletAddress' locale='labels' />:
                    </span>
                    {!!transfer.fromAddress && (
                      <>
                        <span style={{ fontWeight: 700 }}>{` ${transfer.fromAddress}`}</span>
                        <IconButton
                          onClick={() => handleCopy(transfer.fromAddress)}
                        >
                          <Icon icon='mdi:content-copy' />
                        </IconButton>
                      </>
                    )}
									</Typography>
									<Box
										sx={{
											width: '100%',
											display: 'flex',
											flexDirection: 'column',
											gap: 4,
											justifyContent: 'start',
											mt: 4
										}}
									>
										{networks.map(net => (
											<Box key={net.id}>
												<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
													<Typography variant='caption'>
														<Translations text='network' locale='labels' />:
													</Typography>
													<Typography
														variant='body1'
														sx={{
															width: '100%',
															pl: 2,
															textOverflow: 'ellipsis',
															overflow: 'hidden'
														}}
													>
														{net.displayName}
													</Typography>
												</Box>
												<Box
													key={net.id}
													sx={{
														width: '100%',
														display: 'flex',
														justifyContent: 'flex-start',
														alignItems: 'center'
													}}
												>
													<Tooltip title={net.depositAddress}>
														<Typography
															sx={{
																width: { xs: '100%', md: 'fit-content' },
																textOverflow: 'ellipsis',
																overflow: 'hidden'
															}}
															variant='h6'
															fontWeight={700}
														>
															{net.depositAddress}
														</Typography>
													</Tooltip>
													<IconButton
														sx={{ ml: 4 }}
														color='primary'
														onClick={() => handleCopy(net.depositAddress)}
													>
														<Icon icon='mdi:content-copy' />
													</IconButton>
												</Box>
											</Box>
										))}
									</Box>
								</CardContent>
							</Card>
						)}
					</Grid>
					{networks.length !== 0 && (
						<Grid item xs={12}>
							<TransferTxid transferId={transfer.id} txId={transfer.txId} />
						</Grid>
					)}
				</>
			)}
			{transfer.note && (
				<Grid item xs={12}>
					<TransferNote note={transfer.note} />
				</Grid>
			)}
			<Grid item xs={6}>
				<TransferInfo info={transfer} />
			</Grid>
			<Grid item xs={6}>
				<TransferOperation operation={transfer} />
			</Grid>
		</Grid>
	);
};

export default TransferCards;

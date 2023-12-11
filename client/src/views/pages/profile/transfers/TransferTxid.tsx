import { FC, useEffect, useState } from 'react';

import {
	Card,
	CardContent,
	Grid,
	FormControl,
	Button,
	CircularProgress,
	OutlinedInput,
	InputAdornment,
	IconButton,
	InputLabel,
	CardHeader,
	Typography,
	Box
} from '@mui/material';

import Icon from 'src/@core/components/icon';

import { useForm, Controller } from 'react-hook-form';

import useClipboard from 'src/@core/hooks/useClipboard';
import { useDispatch } from 'react-redux';
import { useAbility } from 'src/hooks/useAbility';

import { fetchTransferById } from 'src/store/apps/transfers';

import authConfig from 'src/configs/auth';
import axios from 'axios';

import { toast } from 'react-hot-toast';

import { AppDispatch } from 'src/store';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

type TxidValuesType = {
	txId: string;
};

const TxidValues: TxidValuesType = {
	txId: ''
};

type TransferTxidProps = {
	transferId: string;
	txId: string | null;
	isAdmin?: boolean;
};

const TransferTxid: FC<TransferTxidProps> = ({ transferId, txId, isAdmin = false }) => {
	const ability = useAbility();
	const {
		settings: { localeId }
	} = useSettings();
	const { control, handleSubmit, formState, setValue, getValues } = useForm({
		defaultValues: TxidValues,
		mode: 'onChange'
	});

	const clipboard = useClipboard({
		onSuccess() {
			toast.success(<Translations text='copied' locale='labels' />, {
				position: 'top-right',
				duration: 1000
			});
		}
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		if (!!txId) setValue('txId', txId);
	}, [txId]);

	const updateTxId = async (data: { transferId: string; txId: string }) => {
		try {
			setIsLoading(true);
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			await axios.patch(authConfig.baseApiUrl + '/transfers/update-txid', data, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			dispatch(fetchTransferById({ id: transferId, localeId }));
			toast.success(<Translations text='success' locale='labels' />, {
				position: 'bottom-center',
				duration: 2000
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				toast.error(<Translations text='error' locale='labels' />, {
					position: 'bottom-center',
					duration: 1000
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = (data: TxidValuesType) => {
		if (!!data.txId) {
			updateTxId({ transferId: transferId, txId: data.txId });
		}
	};

	return (
		<Card>
			<CardHeader title={!isAdmin ? <Translations text='Steps.2' locale='common' /> : ''} />
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={6}>
						{!isAdmin && (
							<Grid item xs={12}>
								<Typography variant='h5'>
									<Translations text='history.enterHash' locale='common' />
								</Typography>
							</Grid>
						)}
						<Grid item xs={12} sx={{ display: 'flex' }}>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-betwwen',
									flexDirection: { xs: 'column', sm: 'row' }
								}}
							>
								<FormControl fullWidth sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
									<InputLabel htmlFor='txid' error={Boolean(formState.errors.txId)}>
										HASH
									</InputLabel>
									<Controller
										name='txId'
										control={control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<OutlinedInput
												value={value}
												fullWidth
												id='txid'
												label='HASH'
												readOnly={!!txId}
												onChange={onChange}
												error={Boolean(formState.errors.txId)}
												endAdornment={
													!!txId ? (
														<InputAdornment position='end'>
															<IconButton
																onClick={() => clipboard.copy(getValues('txId'))}
																size='medium'
																color='secondary'
															>
																<Icon icon='mdi:content-copy' />
															</IconButton>
														</InputAdornment>
													) : (
														''
													)
												}
											/>
										)}
									/>
								</FormControl>
								<Button
									type='submit'
									variant='contained'
									disabled={!!txId || !ability.can('create', 'transfers')}
								>
									{isLoading ? (
										<CircularProgress size={26} />
									) : (
										<Translations text='Submit' locale='buttons' />
									)}
								</Button>
							</Box>
						</Grid>
					</Grid>
				</form>
			</CardContent>
		</Card>
	);
};

export default TransferTxid;

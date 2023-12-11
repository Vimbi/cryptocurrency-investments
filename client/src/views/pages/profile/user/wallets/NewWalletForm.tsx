import { yupResolver } from '@hookform/resolvers/yup';
import {
	Grid,
	FormControl,
	Select,
	Button,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
	InputLabel,
	MenuItem,
	FormHelperText,
	TextField,
	Box,
	Typography
} from '@mui/material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Translations from 'src/layouts/components/Translations';
import { AppDispatch, RootState } from 'src/store';
import { fetchData } from 'src/store/apps/network';
import { fetchData as fetchCurrency } from 'src/store/apps/currencies';
import { WalletType } from 'src/types/apps/userTypes';
import * as yup from 'yup';
import { NetworkType } from 'src/types/apps/networkType';

interface IProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (value: WalletType) => void;
}

const schema = yup.object().shape({
	note: yup.string().required(),
	address: yup.string().required(),
	networkId: yup.string().required()
});

const NewWalletForm = ({ open, onClose, onSubmit }: IProps) => {
	const dispatch = useDispatch<AppDispatch>();
	const { data } = useSelector((state: RootState) => state.currencies);
	const networks = useSelector((state: RootState) => state.networks.data);
	const formWallet = useForm<WalletType>({
		defaultValues: {
			networkId: '',
			address: '',
			note: ''
		},
		mode: 'onChange',
		resolver: yupResolver(schema)
	});

	useEffect(() => {
		dispatch(fetchData({}));
		dispatch(fetchCurrency());
	}, [dispatch]);

	const handleClose = () => {
		onClose();
		formWallet.reset();
	};

	return (
		<Dialog maxWidth='sm' fullWidth open={open} onClose={handleClose}>
			<form onSubmit={formWallet.handleSubmit(onSubmit)}>
				<DialogTitle>
					<Translations text='AddWallet' locale='buttons' />
				</DialogTitle>
				<DialogContent>
					<Grid sx={{ py: 4 }} container spacing={5}>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<InputLabel error={Boolean(formWallet.formState.errors.networkId)}>
									<Translations text='network' locale='labels' />
								</InputLabel>
								<Controller
									name='networkId'
									control={formWallet.control}
									render={({ field }) => (
										<Select
											error={Boolean(formWallet.formState.errors.networkId)}
											label={<Translations text='network' locale='labels' />}
											{...field}
										>
											{networks?.map((val: NetworkType) => (
												<MenuItem key={val.id} value={val.id}>
													<Box
														sx={{
															width: '100%',
															display: 'flex',
															justifyContent: 'space-between',
															alignItems: 'center'
														}}
													>
														<Typography variant='body1'>{val.displayName}</Typography>
														<Typography variant='caption'>
															{
																data?.find(currency => currency.id === val.currencyId)
																	?.symbol
															}
														</Typography>
													</Box>
												</MenuItem>
											))}
										</Select>
									)}
								/>
								{formWallet.formState.errors.networkId && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{formWallet.formState.errors.networkId.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='address'
									control={formWallet.control}
									render={({ field }) => (
										<TextField
											error={Boolean(formWallet.formState.errors.address)}
											{...field}
											label={<Translations text='walletAddress' locale='labels' />}
										/>
									)}
								/>
								{formWallet.formState.errors.address && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{formWallet.formState.errors.address.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='note'
									control={formWallet.control}
									render={({ field }) => (
										<TextField
											multiline
											rows={3}
											error={Boolean(formWallet.formState.errors.note)}
											{...field}
											label={<Translations text='note' locale='labels' />}
										/>
									)}
								/>
								{formWallet.formState.errors.note && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{formWallet.formState.errors.note.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions className='dialog-actions-dense'>
					<Button variant='outlined' color='error' onClick={handleClose}>
						{<Translations text='Cancel' locale='buttons' />}
					</Button>
					<Button variant='contained' color='primary' type='submit'>
						{<Translations text='Add' locale='buttons' />}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default NewWalletForm;

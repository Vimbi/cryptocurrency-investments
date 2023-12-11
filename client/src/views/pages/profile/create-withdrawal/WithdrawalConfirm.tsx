import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	CircularProgress,
	DialogTitle,
	Typography,
	FormControl,
	TextField
} from '@mui/material';
import Translations from 'src/layouts/components/Translations';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import authConfig from 'src/configs/auth';
import { Controller, useForm } from 'react-hook-form';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

interface IProps {
	open: boolean;
	isLoading: boolean;
	onClose: () => void;
}

const WithdrawalConfirm: FC<IProps> = ({ open, isLoading, onClose }) => {
	const router = useRouter();
	const { amount, withdrawalAddress } = router.query;
	const [errors, setErrors] = useState<string | string[]>();
	const { fixedCurrency } = useSelector((state: RootState) => state.currencies);
	const confirm = useForm({
		defaultValues: { fixedCurrencyRateId: `${fixedCurrency?.id}`, amount: '', withdrawalAddress: '', code: '' }
	});

	useEffect(() => {
		if (open)
			confirm.reset({
				withdrawalAddress: withdrawalAddress?.toString(),
				amount: amount?.toString(),
				fixedCurrencyRateId: fixedCurrency?.id
			});
	}, [open, fixedCurrency?.id, withdrawalAddress, amount]);

	const onSubmit = async (values: {
		fixedCurrencyRateId: string;
		amount: string;
		withdrawalAddress: string;
		code: string;
	}) => {
		try {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			const response = await axios.post(authConfig.baseApiUrl + '/transfers/create-withdrawal', values, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			if (response.data?.id) {
				router.push('/apps/profile/transfers/' + response.data.id + '?successWithdrawal=true');
				toast.success(<Translations text='success' locale='labels' />, {
					position: 'bottom-center'
				});
			}
		} catch (err) {
			if (isAxiosError(err)) {
				if (err.response?.data.message) {
					const errMes = err.response?.data.message;
					setErrors(errMes);
				}
			}
		}
	};

	return (
		<Dialog onClose={onClose} open={open}>
			<form onSubmit={confirm.handleSubmit(onSubmit)}>
				<DialogTitle>
					<Translations text='Withdrawal.title' locale='common' />
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<Translations text='Withdrawal.description' locale='common' />{' '}
						<Typography component='span' variant='body1'>
							{isLoading ? <CircularProgress size={12} /> : amount}
						</Typography>
					</DialogContentText>
					<FormControl fullWidth sx={{ my: 4 }}>
						<Controller
							name='code'
							control={confirm.control}
							rules={{ required: true }}
							render={({ field }) => <TextField {...field} label='Code' />}
						/>
					</FormControl>
					{Array.isArray(errors) ? (
						errors.map(e => (
							<Typography key={e} variant='body2' color='error'>
								{e}
							</Typography>
						))
					) : (
						<Typography variant='body2' color='error'>
							{errors}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button color='error' onClick={onClose}>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					<Button variant='outlined' type='submit' disabled={isLoading}>
						{isLoading ? <CircularProgress size={20} /> : <Translations text='Submit' locale='buttons' />}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default WithdrawalConfirm;

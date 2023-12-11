import { Button, FormControl, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import Translations from 'src/layouts/components/Translations';
import TrasnitTransferConfirm from './TransitTransferConfirm';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

type TransitionTransfer = {
	toUserId: string;
	amount: number | null;
};

const defaultValues = { toUserId: '', amount: null };

const TransitTransferForm = () => {
	const form = useForm({ defaultValues });
	const router = useRouter();

	const { transitTransferConfirmed } = router.query;

	const onSubmit = async (values: TransitionTransfer) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const res = await axios.post(
				`${authConfig.baseApiUrl}/transactions/send-internal-transaction-code`,
				values,
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			if (res.status === 201) router.push({ query: { ...values } });
		} catch (err) {
			if (isAxiosError(err) && err.response?.data.message) {
				const er = err.response.data.message;
				if (Array.isArray(er)) er.map(e => toast.error(e));
				else toast.error(er);
			}
		}
	};

	useEffect(() => {
		if (Boolean(transitTransferConfirmed)) form.reset({ toUserId: '', amount: null });
	}, [transitTransferConfirmed]);

	return (
		<>
			<TrasnitTransferConfirm />
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormControl fullWidth sx={{ mb: 6 }}>
					<Controller
						name='amount'
						control={form.control}
						rules={{ required: true }}
						render={({ field }) => (
							<TextField
								placeholder='0$'
								label={<Translations text='amountTransition' locale='labels' />}
								type='number'
								required={true}
								{...field}
							/>
						)}
					/>
				</FormControl>
				<FormControl fullWidth sx={{ mb: 6 }}>
					<Controller
						name='toUserId'
						control={form.control}
						rules={{ required: true }}
						render={({ field }) => (
							<TextField
								label={<Translations text='userId' locale='labels' />}
								required={true}
								{...field}
							/>
						)}
					/>
				</FormControl>
				<Button fullWidth size='large' type='submit' variant='contained'>
					<Translations text='Transfer' locale='buttons' />
				</Button>
			</form>
		</>
	);
};

export default TransitTransferForm;

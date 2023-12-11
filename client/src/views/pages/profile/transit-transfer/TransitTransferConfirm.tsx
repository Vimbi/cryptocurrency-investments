import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	TextField
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Translations from 'src/layouts/components/Translations';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import toast from 'react-hot-toast';

type TransitionTransferConfirmation = {
	toUserId?: string | string[];
	amount?: string | string[];
	code: string;
};

const TrasnitTransferConfirm = () => {
	const router = useRouter();
	const { amount, toUserId } = router.query;

	const confirm = useForm({ defaultValues: { amount, toUserId, code: '' } });

	const [open, setOpen] = useState(false);

	const onClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		if (amount && toUserId) {
			setOpen(true);
			confirm.reset({ amount, toUserId });
		}
	}, [router.query]);

	const onSubmit = async (values: TransitionTransferConfirmation) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const res = await axios.post(`${authConfig.baseApiUrl}/transactions/create-internal-transaction`, values, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			if (res.status === 201) {
				onClose();
				toast.success(<Translations text='success' locale='labels' />);
				router.push({ query: { transitTransferConfirmed: true } });
			}
		} catch (error) {
			if (isAxiosError(error)) {
				if (error.response?.data.message) {
					onClose();
					const err = error.response?.data.message;
					if (Array.isArray(err)) err.forEach(e => toast.error(e));
					else toast.error(err);
				}
			}
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<form onSubmit={confirm.handleSubmit(onSubmit)}>
				<DialogTitle>
					<Translations text='TransferConfirm.title' locale='common' />
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<Translations text='TransferConfirm.description' locale='common' />
					</DialogContentText>
					<FormControl fullWidth sx={{ my: 4 }}>
						<Controller
							name='code'
							control={confirm.control}
							rules={{ required: true }}
							render={({ field }) => <TextField {...field} label='Code' />}
						/>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} color='error'>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					<Button variant='outlined' type='submit'>
						<Translations text='Submit' locale='buttons' />
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default TrasnitTransferConfirm;

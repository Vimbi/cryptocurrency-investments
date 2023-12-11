// ** React Imports
import { FC, Fragment, useEffect, useState } from 'react';

// ** MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { FormControl, FormHelperText } from '@mui/material';

import { MuiOtpInput } from 'mui-one-time-password-input';

import { useForm, Controller } from 'react-hook-form';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Translations from 'src/layouts/components/Translations';

interface DialogConfirmPhoneProps {
	open: boolean;
	code?: string | null;
	error?: string | null;
	resent?: boolean;
	setIsClose: () => void;
	onConfirm: (code: string) => void;
	onResent?: () => void;
}

const schema = yup.object().shape({
	code: yup.string().required()
});

const defaultValues = {
	code: ''
};

const DialogSendCode: FC<DialogConfirmPhoneProps> = ({
	open,
	error,
	code,
	resent,
	setIsClose,
	onConfirm,
	onResent
}) => {
	const handleClose = () => setIsClose();

	const [resentTime, setResentTime] = useState(30);

	const {
		control,
		setValue,
		setError,
		handleSubmit,
		formState: { errors }
	} = useForm({ defaultValues, mode: 'onBlur', resolver: yupResolver(schema) });

	useEffect(() => {
		if (code && typeof code === 'string') {
			setValue('code', code);
		}
	}, [code]);

	useEffect(() => {
		if (error && typeof error === 'string') {
			setError('code', {
				message: error
			});
		}
	}, [error]);

	const onSubmit = (data: { code: string }) => {
		onConfirm(data.code);
	};

	const handleOnResent = () => {
		if (onResent) {
			onResent();
			handleOnResentTime();
			setValue('code', '');
		}
	};

	const handleOnResentTime = () => {
		setResentTime(30);
		const interval = setInterval(() => {
			setResentTime(prev => prev - 1);
		}, 1000);
		setTimeout(() => {
			clearInterval(interval);
		}, 30000);
	};

	const handleOnComplete = (code: string) => {
		onConfirm(code);
	};

	useEffect(() => {
		handleOnResentTime();
	}, []);

	return (
		<Fragment>
			<Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>На ваш номер был отправлен код</DialogTitle>
				<form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
					<DialogContent>
						<FormControl fullWidth sx={{ mb: 4 }}>
							<Controller
								name='code'
								control={control}
								rules={{ required: true }}
								render={({ field: { value, onChange } }) => (
									<MuiOtpInput
										sx={{
											gap: { xs: 2, sm: 5 },
											'& input': { p: { xs: '.5rem 0', sm: '1rem .75rem' } }
										}}
										autoFocus
										value={value}
										onChange={onChange}
										length={6}
										onComplete={handleOnComplete}
									/>
								)}
							/>
							{errors.code && (
								<FormHelperText sx={{ color: 'error.main' }}>
									<Translations text={`${errors.code.message}`} locale='common' />
								</FormHelperText>
							)}
						</FormControl>
					</DialogContent>
					<DialogActions className='dialog-actions-dense'>
						{!!resent && (
							<Button fullWidth onClick={handleOnResent} disabled={!!resentTime}>
								{resentTime ? `Отправить код повторно через ${resentTime}` : 'Отправить код повторно'}
							</Button>
						)}

						<Button fullWidth type='submit' variant='contained'>
							<Translations text='submit' locale='buttons' />
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Fragment>
	);
};

export default DialogSendCode;

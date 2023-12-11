// ** React Imports
import { FC, Fragment, useEffect, useState } from 'react';

// ** MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import { FormControl, FormHelperText } from '@mui/material';

import { MuiOtpInput } from 'mui-one-time-password-input';

import { useRouter } from 'next/router';

import { useForm, Controller } from 'react-hook-form';

import toast from 'react-hot-toast';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useAuth } from 'src/hooks/useAuth';

import { ConfirmCallbackType } from 'src/context/types';

interface DialogConfirmPhoneProps {
	open: boolean;
	setIsClose: (value: boolean) => void;
	userId: string | string[];
	email?: string | string[];
	errors?: string[] | undefined;
}

const schema = yup.object().shape({
	code: yup.string().required()
});

const defaultValues = {
	code: ''
};

const DialogConfirmPhone: FC<DialogConfirmPhoneProps> = ({ open, setIsClose, userId, email }) => {
	const router = useRouter();

	const auth = useAuth();

	const code = router.query.code;

	const handleClose = () => setIsClose(false);

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

	const confirmCallback: ConfirmCallbackType = value => {
		if (value) {
			setIsClose(false);
			router.push('/login');
			toast.success('Номер телефона успешно подтверждён!', {
				position: 'bottom-center',
				duration: 5000
			});
		} else {
			setError('code', {
				message: 'Неправильный код'
			});
		}
	};

	const confirmPhone = (code: string) => {
		if (userId && typeof userId === 'string') {
			auth.confirmPhone({ code: code, userId }, confirmCallback);
		}
	};

	const onSubmit = (data: { code: string }) => {
		confirmPhone(data.code);
	};

	const handleOnResent = () => {
		handleOnResentTime();
		if (!!email && typeof email === 'string') auth.resetConfirmPhone({ email });
		setValue('code', '');
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
		confirmPhone(code);
	};

	useEffect(() => {
		handleOnResentTime();
	}, []);

	return (
		<Fragment>
			<Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>Подтверждение номера телефона</DialogTitle>
				<form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
					<DialogContent>
						<DialogContentText sx={{ mb: 3 }}>На ваш номер был отправлен код</DialogContentText>
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
								<FormHelperText sx={{ color: 'error.main' }}>{errors.code.message}</FormHelperText>
							)}
						</FormControl>
					</DialogContent>
					<DialogActions className='dialog-actions-dense'>
						{email && (
							<Button fullWidth onClick={handleOnResent} disabled={!!resentTime}>
								{resentTime ? `Отправить код повторно через ${resentTime}` : 'Отправить код повторно'}
							</Button>
						)}
						<Button fullWidth type='submit' variant='contained'>
							Подтвердить
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Fragment>
	);
};

export default DialogConfirmPhone;

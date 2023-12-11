// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { toast } from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';

const ChangeEmailCard = () => {
	// ** States
	const [open, setOpen] = useState<boolean>(false);
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

	// ** Hooks
	const {
		control,
		setValue,
		setError,
		clearErrors,
		handleSubmit,
		formState: { errors }
	} = useForm({ defaultValues: { email: '' } });

	const toggle2FADialog = () => setOpen(!open);

	const on2FAFormSubmit = async (data: { email: string }) => {
		try {
			const resData = await axios.patch(
				`${authConfig.baseApiUrl}/auth/me/change-email`,
				{ ...data },
				{
					headers: {
						Authorization: `Bearer ${storedToken}`
					}
				}
			);
			if (resData.status === 200) {
				toast.success(<Translations text='EmailSent' locale='common' />);
				toggle2FADialog();
				setValue('email', '');
			}
		} catch (e) {
			setError('email', {});
		}
	};

	const close2FADialog = () => {
		toggle2FADialog();
		clearErrors('email');
		setValue('email', '');
	};

	return (
		<>
			<Card>
				<CardHeader title='E-mail' />
				<CardContent>
					<Typography sx={{ mb: 4, color: 'text.secondary' }}>
						<Translations text='EmailChanging' locale='common' />
					</Typography>
					<Typography sx={{ mb: 6, color: 'text.secondary' }}>
						<Translations text='SecurityEmail.title' locale='common' />
					</Typography>
					<Button variant='contained' onClick={toggle2FADialog}>
						<Translations text='Edit' locale='buttons' />
					</Button>
				</CardContent>
			</Card>

			<Dialog fullWidth open={open} onClose={toggle2FADialog}>
				<DialogContent
					sx={{
						px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
						py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
					}}
				>
					<Box sx={{ mb: 12, display: 'flex', justifyContent: 'center' }}>
						<Typography variant='h5' sx={{ fontSize: '1.625rem' }}>
							<Translations text='SecurityEmail.dialogTitle' locale='common' />
						</Typography>
					</Box>

					<IconButton
						size='small'
						onClick={close2FADialog}
						sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
					>
						<Icon icon='mdi:close' />
					</IconButton>
					<Typography sx={{ mt: 4, mb: 6 }}>
						<Translations text='SecurityEmail.dialogDescription' locale='common' />
					</Typography>

					<form onSubmit={handleSubmit(on2FAFormSubmit)}>
						<FormControl fullWidth sx={{ mb: 4 }}>
							<InputLabel htmlFor='update-email' error={Boolean(errors.email)}>
								E-mail
							</InputLabel>
							<Controller
								name='email'
								control={control}
								rules={{ required: true }}
								render={({ field: { value, onChange } }) => (
									<OutlinedInput
										type='email'
										value={value}
										onChange={onChange}
										label='E-mail'
										id='update-email'
										placeholder='example@mail.com'
										error={Boolean(errors.email)}
									/>
								)}
							/>
							{errors.email && (
								<FormHelperText sx={{ color: 'error.main' }}>
									<Translations text='invalidEmail' locale='labels' />
								</FormHelperText>
							)}
						</FormControl>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button type='reset' variant='outlined' color='secondary' onClick={close2FADialog}>
								<Translations text='Cancel' locale='buttons' />
							</Button>
							<Button variant='contained' type='submit' sx={{ ml: 3.5 }}>
								<Translations text='Save' locale='buttons' />
							</Button>
						</Box>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ChangeEmailCard;

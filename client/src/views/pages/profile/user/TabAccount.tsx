// ** React Imports
import { useState, useEffect } from 'react';

// ** MUI Imports
import { Divider, IconButton, InputLabel, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';

// ** Third Party Imports
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Hooks
import useClipboard from 'src/@core/hooks/useClipboard';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { AppDispatch, RootState } from 'src/store';
import { yupResolver } from '@hookform/resolvers/yup';
import { updateEmail, updateProfile } from 'src/store/apps/profile';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import { toast } from 'react-hot-toast';
import { parseErrors } from 'src/@core/utils/parseErrors';
import Translations from 'src/layouts/components/Translations';

interface Data {
	id: string;
	parentId: string;
	phone: string;
	email: string;
	firstName: string;
	lastName: string;
	surname: string;
	refreshToken: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string;
}

const defaultValues: Data = {
	id: '',
	parentId: '',
	phone: '',
	email: '',
	firstName: '',
	lastName: '',
	surname: '',
	refreshToken: '',
	createdAt: '',
	updatedAt: '',
	deletedAt: ''
};

const schema = yup.object().shape({
	phone: yup.string(),
	email: yup.string(),
	firstName: yup.string(),
	lastName: yup.string(),
	surname: yup.string()
});

const TabAccount = () => {
	const dispatch = useDispatch<AppDispatch>();
	const clipboard = useClipboard();
	const { profile } = useSelector((state: RootState) => state.profile);

	// ** State
	const [open, setOpen] = useState<boolean>(false);
	const [userInput, setUserInput] = useState<string>('yes');
	const [telegramLink, setTelegramLink] = useState<string>();
	const [secondDialogOpen, setSecondDialogOpen] = useState<boolean>(false);

	useEffect(() => {
		if (profile) {
			for (const key in profile) {
				if (Object.prototype.hasOwnProperty.call(profile, key)) {
					setValue(key as keyof Data, profile[key as keyof Data] || '');
				}
			}
		}
	}, [profile]);

	// ** Hooks
	const {
		control,
		handleSubmit,
		setValue,
		setError,
		formState: { errors }
	} = useForm({ defaultValues, resolver: yupResolver(schema) });

	const handleClose = () => setOpen(false);

	const handleSecondDialogClose = () => setSecondDialogOpen(false);

	const onSubmit = async (data: Data) => {
		const filteredData: Partial<Data> = {};
		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				if (profile) {
					const typedKey = key as keyof Data;
					if (data[typedKey] !== profile[typedKey] && data[typedKey] !== '') {
						filteredData[typedKey] = data[typedKey];
					}
				}
			}
		}
		if (Object.keys(filteredData).length > 0) {
			const resEdit = await dispatch(updateProfile(filteredData));
			if (!!filteredData.email) {
				const email = filteredData.email;
				const resEmail = await dispatch(updateEmail({ email }));
				if (isAxiosError(resEmail.payload)) {
					const err = resEmail.payload;
					if (err.response?.data.message && Array.isArray(err.response?.data.message)) {
						const errors = parseErrors(err.response?.data.message);
						errors.forEach(err => {
							if (err?.key) {
								setError(err.key as keyof Data, {
									type: 'manual',
									message: err.message
								});
							}
						});
					}
					if (err.response?.status === 500) {
						toast.error(<Translations text='error' locale='labels' />);
					}
				}
				if (resEmail.meta.requestStatus === 'fulfilled') {
					toast.success(<Translations text='EmailChangeSuccess' locale='common' />);
				}
			}
			if (resEdit.payload === 200) {
				toast.success(<Translations text='success' locale='labels' />);
			}
		}
	};

	const handleConfirmation = (value: string) => {
		handleClose();
		setUserInput(value);
		setSecondDialogOpen(true);
	};

	const handleGetTelegramLink = async () => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const res = await axios.get(`${authConfig.baseApiUrl}/telegram-bot/get-bot-connection-link`, {
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		if (res.status === 200) {
			setTelegramLink(res.data.link);
		}
	};
	useEffect(() => {
		handleGetTelegramLink();
	}, [dispatch]);

	return (
		<Grid container spacing={6}>
			{/* Account Details Card */}
			<Grid item xs={12}>
				<Card>
					<form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
						<CardContent>
							<Grid container spacing={5}>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='firstName'
											control={control}
											rules={{ required: true }}
											render={({ field: { value, onChange, onBlur } }) => (
												<TextField
													fullWidth
													label={<Translations text='name' locale='labels' />}
													value={value}
													onBlur={onBlur}
													onChange={onChange}
													error={Boolean(errors.firstName)}
												/>
											)}
										/>
										{errors.firstName && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{errors.firstName.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='lastName'
											control={control}
											rules={{ required: true }}
											render={({ field: { value, onChange, onBlur } }) => (
												<TextField
													fullWidth
													label={<Translations text='surname' locale='labels' />}
													value={value}
													onBlur={onBlur}
													onChange={onChange}
													error={Boolean(errors.lastName)}
												/>
											)}
										/>
										{errors.lastName && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{errors.lastName.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='surname'
											control={control}
											rules={{ required: true }}
											render={({ field: { value, onChange, onBlur } }) => (
												<TextField
													fullWidth
													label={<Translations text='patronymic' locale='labels' />}
													value={value}
													onBlur={onBlur}
													onChange={onChange}
													error={Boolean(errors.surname)}
												/>
											)}
										/>
										{errors.surname && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{errors.surname.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='email'
											control={control}
											render={({ field: { value, onChange, onBlur } }) => (
												<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
													<TextField
														fullWidth
														label='E-mail'
														value={value}
														onBlur={onBlur}
														onChange={onChange}
														error={Boolean(errors.email)}
													/>
													<Tooltip
														title={
															<Typography sx={{ color: 'white', whiteSpace: 'pre-wrap' }}>
																<Translations
																	text='EmailChangeTooltip'
																	locale='common'
																/>
															</Typography>
														}
														placement='bottom-start'
													>
														<IconButton>
															<Icon icon='mdi:help' />
														</IconButton>
													</Tooltip>
												</Box>
											)}
										/>
										{errors.email && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{errors.email.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='phone'
											control={control}
											rules={{ required: true }}
											render={({ field: { value, onChange, onBlur } }) => (
												<TextField
													InputProps={{ readOnly: true }}
													fullWidth
													type='number'
													label={<Translations text='phone' locale='labels' />}
													value={value}
													onBlur={onBlur}
													onChange={onChange}
													error={Boolean(errors.phone)}
												/>
											)}
										/>
										{errors.phone && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{errors.phone.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth>
										<Controller
											name='id'
											control={control}
											render={({ field: { value } }) => (
												<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
													<InputLabel>
														<Translations text='userId' locale='labels' />
													</InputLabel>
													<OutlinedInput
														fullWidth
														readOnly
														label={<Translations text='userId' locale='labels' />}
														value={value}
														endAdornment={
															<InputAdornment position='end'>
																<IconButton
																	onClick={() => clipboard.copy(value)}
																	size='medium'
																	color='secondary'
																>
																	<Icon icon='mdi:content-copy' />
																</IconButton>
															</InputAdornment>
														}
													/>
													<Tooltip
														title={
															<Typography sx={{ color: 'white', whiteSpace: 'pre-wrap' }}>
																<Translations text='UserIdClipboard' locale='common' />
															</Typography>
														}
														placement='bottom-start'
													>
														<IconButton>
															<Icon icon='mdi:help' />
														</IconButton>
													</Tooltip>
												</Box>
											)}
										/>
									</FormControl>
								</Grid>

								<Grid item xs={12}>
									<Box
										sx={{
											width: '100%',
											display: 'flex',
											gap: 4,
											flexDirection: { xs: 'column', sm: 'row' }
										}}
									>
										<Button type='submit' variant='contained'>
											<Translations text='Save' locale='buttons' />
										</Button>
									</Box>
								</Grid>
							</Grid>
						</CardContent>
					</form>
					<Divider />
					<CardContent>
						{!!telegramLink && (
							<Tooltip title='Ссылка на телеграм-бота'>
								<Button variant='contained' href={telegramLink} target='_blank'>
									telegram-bot
								</Button>
							</Tooltip>
						)}
					</CardContent>
				</Card>
			</Grid>

			<Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
				<DialogContent
					sx={{
						pb: theme => `${theme.spacing(6)} !important`,
						px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
						pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
					}}
				>
					<Box
						sx={{
							display: 'flex',
							textAlign: 'center',
							alignItems: 'center',
							flexDirection: 'column',
							justifyContent: 'center',
							'& svg': { mb: 6, color: 'warning.main' }
						}}
					>
						<Icon icon='mdi:alert-circle-outline' fontSize='5.5rem' />
						<Typography>Are you sure you would like to cancel your subscription?</Typography>
					</Box>
				</DialogContent>
				<DialogActions
					sx={{
						justifyContent: 'center',
						px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
						pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
					}}
				>
					<Button variant='contained' sx={{ mr: 2 }} onClick={() => handleConfirmation('yes')}>
						Yes
					</Button>
					<Button variant='outlined' color='secondary' onClick={() => handleConfirmation('cancel')}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog fullWidth maxWidth='xs' open={secondDialogOpen} onClose={handleSecondDialogClose}>
				<DialogContent
					sx={{
						pb: theme => `${theme.spacing(6)} !important`,
						px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
						pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							flexDirection: 'column',
							'& svg': {
								mb: 8,
								color: userInput === 'yes' ? 'success.main' : 'error.main'
							}
						}}
					>
						<Icon
							fontSize='5.5rem'
							icon={userInput === 'yes' ? 'mdi:check-circle-outline' : 'mdi:close-circle-outline'}
						/>
						<Typography variant='h4' sx={{ mb: 5 }}>
							{userInput === 'yes' ? 'Deleted!' : 'Cancelled'}
						</Typography>
						<Typography>
							{userInput === 'yes'
								? 'Your subscription cancelled successfully.'
								: 'Unsubscription Cancelled!!'}
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions
					sx={{
						justifyContent: 'center',
						px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
						pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
					}}
				>
					<Button variant='contained' color='success' onClick={handleSecondDialogClose}>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

export default TabAccount;

// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Third Party Imports
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { updateProfilePassword } from 'src/store/apps/profile';
import Translations from 'src/layouts/components/Translations';

interface State {
	showNewPassword: boolean;
	showCurrentPassword: boolean;
	showConfirmNewPassword: boolean;
}

type Values = {
	newPassword: string;
	currentPassword: string;
	confirmNewPassword: string;
};

const defaultValues: Values = {
	newPassword: '',
	currentPassword: '',
	confirmNewPassword: ''
};

const schema = yup.object().shape({
	currentPassword: yup.string().required(),
	newPassword: yup
		.string()
		.min(8)
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
			'Must contain 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special case character'
		)
		.required(),
	confirmNewPassword: yup
		.string()
		.required()
		.oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const ChangePasswordCard = () => {
	const dispatch = useDispatch<AppDispatch>();

	// ** States
	const [values, setValues] = useState<State>({
		showNewPassword: false,
		showCurrentPassword: false,
		showConfirmNewPassword: false
	});

	// ** Hooks
	const {
		reset,
		control,
		handleSubmit,
		formState: { errors }
	} = useForm({ defaultValues, resolver: yupResolver(schema) });

	const handleClickShowCurrentPassword = () => {
		setValues({ ...values, showCurrentPassword: !values.showCurrentPassword });
	};

	const handleClickShowNewPassword = () => {
		setValues({ ...values, showNewPassword: !values.showNewPassword });
	};

	const handleClickShowConfirmNewPassword = () => {
		setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword });
	};

	const onPasswordFormSubmit = async (data: Values) => {
		const result = await dispatch(
			updateProfilePassword({
				oldPassword: data.currentPassword,
				newPassword: data.confirmNewPassword
			})
		);
		if (result.meta.requestStatus == 'fulfilled') {
			toast.success(<Translations text='success' locale='labels' />);
			reset(defaultValues);
		} else {
			toast.error(<Translations text='error' locale='labels' />);
		}
	};

	return (
		<Card>
			<CardHeader title={<Translations text='PasswordReset' locale='common' />} />
			<CardContent>
				<form onSubmit={handleSubmit(onPasswordFormSubmit)}>
					<Grid container spacing={5}>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel htmlFor='input-current-password' error={Boolean(errors.currentPassword)}>
									<Translations text='oldPassword' locale='labels' />
								</InputLabel>
								<Controller
									name='currentPassword'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange } }) => (
										<OutlinedInput
											value={value}
											label={<Translations text='oldPassword' locale='labels' />}
											onChange={onChange}
											id='input-current-password'
											error={Boolean(errors.currentPassword)}
											type={values.showCurrentPassword ? 'text' : 'password'}
											endAdornment={
												<InputAdornment position='end'>
													<IconButton
														edge='end'
														onMouseDown={e => e.preventDefault()}
														onClick={handleClickShowCurrentPassword}
													>
														<Icon
															icon={
																values.showCurrentPassword
																	? 'mdi:eye-outline'
																	: 'mdi:eye-off-outline'
															}
														/>
													</IconButton>
												</InputAdornment>
											}
										/>
									)}
								/>
								{errors.currentPassword && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.currentPassword.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
					</Grid>
					<Grid container spacing={5} sx={{ mt: 0 }}>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel htmlFor='input-new-password' error={Boolean(errors.newPassword)}>
									<Translations text='newPassword' locale='labels' />
								</InputLabel>
								<Controller
									name='newPassword'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange } }) => (
										<OutlinedInput
											value={value}
											label={<Translations text='newPassword' locale='labels' />}
											onChange={onChange}
											id='input-new-password'
											error={Boolean(errors.newPassword)}
											type={values.showNewPassword ? 'text' : 'password'}
											endAdornment={
												<InputAdornment position='end'>
													<IconButton
														edge='end'
														onClick={handleClickShowNewPassword}
														onMouseDown={e => e.preventDefault()}
													>
														<Icon
															icon={
																values.showNewPassword
																	? 'mdi:eye-outline'
																	: 'mdi:eye-off-outline'
															}
														/>
													</IconButton>
												</InputAdornment>
											}
										/>
									)}
								/>
								{errors.newPassword && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.newPassword.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel
									htmlFor='input-confirm-new-password'
									error={Boolean(errors.confirmNewPassword)}
								>
									<Translations text='newPasswordConfirm' locale='labels' />
								</InputLabel>
								<Controller
									name='confirmNewPassword'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange } }) => (
										<OutlinedInput
											value={value}
											label={<Translations text='newPasswordConfirm' locale='labels' />}
											onChange={onChange}
											id='input-confirm-new-password'
											error={Boolean(errors.confirmNewPassword)}
											type={values.showConfirmNewPassword ? 'text' : 'password'}
											endAdornment={
												<InputAdornment position='end'>
													<IconButton
														edge='end'
														onMouseDown={e => e.preventDefault()}
														onClick={handleClickShowConfirmNewPassword}
													>
														<Icon
															icon={
																values.showConfirmNewPassword
																	? 'mdi:eye-outline'
																	: 'mdi:eye-off-outline'
															}
														/>
													</IconButton>
												</InputAdornment>
											}
										/>
									)}
								/>
								{errors.confirmNewPassword && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.confirmNewPassword.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<Typography sx={{ mt: 1, color: 'text.secondary' }}>
								<Translations text='PasswordRequirements' locale='common' />
							</Typography>
							<Box
								component='ul'
								sx={{
									pl: 4,
									mb: 0,
									'& li': { mb: 4, color: 'text.secondary', '&::marker': { fontSize: '1.25rem' } }
								}}
							>
								<li>
									<Translations text='PasswordRequirements1' locale='common' />
								</li>
								<li>
									<Translations text='PasswordRequirements2' locale='common' />
								</li>
								<li>
									<Translations text='PasswordRequirements3' locale='common' />
								</li>
							</Box>
						</Grid>
						<Grid item xs={12}>
							<Button variant='contained' type='submit' sx={{ mr: 3 }}>
								<Translations text='Submit' locale='buttons' />
							</Button>
							<Button type='reset' variant='outlined' color='secondary' onClick={() => reset()}>
								<Translations text='Clear' locale='buttons' />
							</Button>
						</Grid>
					</Grid>
				</form>
			</CardContent>
		</Card>
	);
};

export default ChangePasswordCard;

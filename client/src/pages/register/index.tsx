// ** React Imports
import { ReactNode, useEffect, useState } from 'react';

// ** Next Import
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Components
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Box, { BoxProps } from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import useMediaQuery from '@mui/material/useMediaQuery';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { FormHelperText } from '@mui/material';

// import { MuiTelInput } from 'mui-tel-input';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAuth } from 'src/hooks/useAuth';

// ** Demo Imports
import * as yup from 'yup';
import * as cookie from 'cookie';
import { yupResolver } from '@hookform/resolvers/yup';
import DialogConfirmPhone from 'src/views/components/dialogs/DialogConfirmPhone';
import { parseErrors } from 'src/@core/utils/parseErrors';
import { ErrRegisterCallbackType, RegisterParams } from 'src/context/types';
import { toast } from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

// ** Styled Components
const LinkStyledLogo = styled(Link)(() => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none'
}));

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	width: '100%',
	[theme.breakpoints.up('md')]: {
		maxWidth: 450
	}
}));

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	[theme.breakpoints.down('xl')]: {
		width: '100%'
	},
	[theme.breakpoints.down('md')]: {
		maxWidth: 400
	}
}));

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
	fontWeight: 600,
	marginBottom: theme.spacing(1.5),
	[theme.breakpoints.down('md')]: { mt: theme.spacing(8) }
}));

const LinkStyled = styled(Link)(({ theme }) => ({
	textDecoration: 'none',
	color: theme.palette.primary.main
}));

interface defaultValues extends RegisterParams {
	accept: boolean;
}

const defaultValues: defaultValues = {
	email: '',
	password: '',
	firstName: '',
	lastName: '',
	surname: '',
	referralCode: '',
	accept: false
};

type KeysAsString = `${keyof RegisterParams}`;

const Register = () => {
	// ** States
	const [showPassword, setShowPassword] = useState<boolean>(false);

	// ** Hooks
	const router = useRouter();
	const theme = useTheme();
	const { t } = useTranslation('labels');
	const { settings } = useSettings();
	const hidden = useMediaQuery(theme.breakpoints.down('md'));
	const auth = useAuth();

	// ** Vars
	const { skin } = settings;

	const referralCode = router.query.referralCode;
	const userId = router.query.userId;
	const email = router.query.email;

	const schema = yup.object().shape({
		firstName: yup.string().required(`${t('requiredName')}`),
		lastName: yup.string().required(`${t('requiredSurname')}`),
		surname: yup.string().required(`${t('requiredPatronymic')}`),

		// phone: yup.string().required('"Телефон" обязательное поле').min(16, '11 цифр номера'),
		email: yup
			.string()
			.required(`${t('requiredEmail')}`)
			.email(`${t('invalidEmail')}`),
		password: yup.string().required(`${t('requiredPassword')}`),
		referralCode: yup.string().required(`${t('requiredReferralCode')}`),
		accept: yup
			.boolean()
			.required()
			.isTrue(`${t('requiredAccept')}`)
	});

	const {
		control,
		setError,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm({ defaultValues, mode: 'onBlur', resolver: yupResolver(schema) });

	useEffect(() => {
		if (!!referralCode && typeof referralCode === 'string') {
			setValue('referralCode', referralCode);
		}
	}, [referralCode]);

	const hanldeOnError: ErrRegisterCallbackType = err => {
		const message = err.response?.data.message;
		if (message) {
			if (Array.isArray(message)) {
				const errors = parseErrors(message);
				errors.forEach(item => {
					if (item?.key) {
						setError(item.key as KeysAsString, {
							type: 'manual',
							message: item.message
						});
					}
				});
			} else {
				toast.error(message, {
					position: 'bottom-center'
				});
			}
		}
	};

	const handleOnClose = () => {
		const pathname = router.pathname;
		router.push(pathname);
	};

	const onSubmit = (data: defaultValues) => {
		auth.register(data, hanldeOnError);
	};

	return (
		<Box
			className='content-right'
			sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
		>
			<RightWrapper
				sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}
			>
				<Box
					sx={{
						p: 12,
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'background.paper',
						boxShadow:
							'0px 6px 16px -4px rgba(58, 53, 65, 0.10), 0px 2px 12px -4px rgba(58, 53, 65, 0.08), 0px 2px 12px -4px rgba(58, 53,65, 0.10)',
						borderRadius: '6px'
					}}
				>
					<BoxWrapper>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								mb: 4
							}}
						>
							<LinkStyledLogo href='/'>
								<Image alt='logo' src='/images/logo.svg' width={180} height={16} />
							</LinkStyledLogo>
						</Box>
						<Box sx={{ mb: 6 }}>
							<TypographyStyled variant='h5'>
								<Translations text='JoinUs' locale='common' /> 🚀
							</TypographyStyled>
							<Typography variant='body2'>
								<Translations text='RegisterAndStart' locale='common' />
							</Typography>
						</Box>
						<form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
							<FormControl fullWidth sx={{ mb: 4 }}>
								<Controller
									name='firstName'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											autoFocus
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
							<FormControl fullWidth sx={{ mb: 4 }}>
								<Controller
									name='lastName'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											autoFocus
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
							<FormControl fullWidth sx={{ mb: 4 }}>
								<Controller
									name='surname'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											autoFocus
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
							<FormControl fullWidth sx={{ mb: 4 }}>
								<Controller
									name='email'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											label='E-mail'
											placeholder='mail@mail.com'
											autoFocus
											fullWidth
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											error={Boolean(errors.email)}
										/>

										// <MuiTelInput
										// 	fullWidth
										// 	autoFocus
										// 	label='Номер телефона'
										// 	value={value}
										// 	forceCallingCode
										// 	defaultCountry='RU'
										// 	onBlur={onBlur}
										// 	onChange={onChange}
										// 	error={Boolean(errors.phone)}
										// />
									)}
								/>
								{errors.email && (
									<FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>
								)}
							</FormControl>
							<FormControl fullWidth sx={{ mb: 4 }}>
								<InputLabel htmlFor='auth-login-v2-password'>
									<Translations text='password' locale='labels' />
								</InputLabel>
								<Controller
									name='password'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<OutlinedInput
											value={value}
											onBlur={onBlur}
											label={<Translations text='password' locale='labels' />}
											onChange={onChange}
											id='auth-login-v2-password'
											error={Boolean(errors.password)}
											type={showPassword ? 'text' : 'password'}
											endAdornment={
												<InputAdornment position='end'>
													<IconButton
														edge='end'
														onMouseDown={e => e.preventDefault()}
														onClick={() => setShowPassword(!showPassword)}
													>
														<Icon
															icon={
																showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'
															}
														/>
													</IconButton>
												</InputAdornment>
											}
										/>
									)}
								/>
								{errors.password && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.password.message}
									</FormHelperText>
								)}
							</FormControl>
							<FormControl fullWidth sx={{ mb: 4 }}>
								<Controller
									name='referralCode'
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<TextField
											autoFocus
											label={<Translations text='referralCode' locale='labels' />}
											value={value}
											onBlur={onBlur}
											onChange={onChange}
											error={Boolean(errors.referralCode)}
										/>
									)}
								/>
								{errors.referralCode && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.referralCode.message}
									</FormHelperText>
								)}
							</FormControl>
							<FormControl sx={{ mb: 4 }}>
								<FormControlLabel
									control={
										<Controller
											name='accept'
											control={control}
											rules={{ required: true }}
											render={({ field: { value, onChange, onBlur } }) => (
												<Checkbox value={value} onBlur={onBlur} onChange={onChange} />
											)}
										/>
									}
									sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
									label={
										<>
											<Typography variant='body2' component='span'>
												<Translations text='IAgreeWith' locale='common' />{' '}
											</Typography>
											<LinkStyled href='/' onClick={e => e.preventDefault()}>
												<Translations text='TermsOfUse' locale='common' />
											</LinkStyled>
										</>
									}
								/>
								{errors.accept && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{errors.accept.message}
									</FormHelperText>
								)}
							</FormControl>
							<Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
								<Translations text='SignUp' locale='buttons' />
							</Button>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									flexWrap: 'wrap',
									justifyContent: 'center'
								}}
							>
								<Typography variant='body2' sx={{ mr: 2 }}>
									<Translations text='HaveAnAccount' locale='common' />
								</Typography>
								<Typography variant='body2'>
									<LinkStyled href='/login'>
										<Translations text='SignIn' locale='buttons' />
									</LinkStyled>
								</Typography>
							</Box>
						</form>
					</BoxWrapper>
				</Box>
			</RightWrapper>
			{!!userId && (
				<DialogConfirmPhone open={!!userId} setIsClose={handleOnClose} userId={userId} email={email} />
			)}
		</Box>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(lang ?? context.locale, ['buttons', 'labels', 'common'], null, [
				'ru',
				'en'
			]))
		}
	};
};

Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;
Register.guestGuard = true;
export default Register;

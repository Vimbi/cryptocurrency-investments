// ** React Imports
import { useState, ReactNode, useCallback, useEffect, FC } from 'react';

// ** Next Imports
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Components
// import Alert from '@mui/material/Alert';
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
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Typography, { TypographyProps } from '@mui/material/Typography';
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { CircularProgress } from '@mui/material';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Third Party Imports
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as cookie from 'cookie';

// ** Hooks
import { useAuth } from 'src/hooks/useAuth';
import authConfig from 'src/configs/auth';

// import useBgColor from 'src/@core/hooks/useBgColor';
import { useSettings } from 'src/@core/hooks/useSettings';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';
import DialogSendCode from 'src/views/components/dialogs/DialogSendCode';
import { isAxiosError } from 'axios';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

// ** Styled Components
const LinkStyledLogo = styled(Link)(() => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none'
}));

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	width: '100%',
	height: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
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
	fontSize: '0.875rem',
	textDecoration: 'none',
	color: theme.palette.primary.main
}));

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
	'& .MuiFormControlLabel-label': {
		fontSize: '0.875rem',
		color: theme.palette.text.secondary
	}
}));

const schema = yup.object().shape({
	email: yup.string().required().email(),
	password: yup.string().min(5).required()
});

const defaultValues = {
	email: '',
	password: '',
	recaptchaToken: ''
};

interface FormData {
	email: string;
	password: string;
	recaptchaToken: string;
}

const ReCaptchaHandler: FC<{
	setValue: (name: 'recaptchaToken', token: string) => void;
}> = ({ setValue }) => {
	const { executeRecaptcha } = useGoogleReCaptcha();
	console.log('LL: executeRecaptcha', !executeRecaptcha);
	const router = useRouter();

	const handleReCaptchaVerify = useCallback(async () => {
		console.log('Handler Call');
		if (!executeRecaptcha || !authConfig.siteKey) {
			return;
		}

		try {
			const token = await executeRecaptcha();
			console.log('LL: handleReCaptchaVerify -> token', token);
			setValue('recaptchaToken', token);
		} catch (e) {
			console.log('LL: handleReCaptchaVerifyERROR -> e', e);
		}
	}, [executeRecaptcha]);

	useEffect(() => {
		console.log('UseEffect');
		handleReCaptchaVerify();
	}, [handleReCaptchaVerify, router.pathname]);

	return <></>;
};

const LoginPage = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [code, setCode] = useState<string | null>(null);
	const [errorTwoFactor, setErrorTwoFactor] = useState<string | null>(null);

	const [rememberMe, setRememberMe] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	// ** Hooks
	const auth = useAuth();
	const theme = useTheme();
	const { settings } = useSettings();
	const hidden = useMediaQuery(theme.breakpoints.down('md'));

	// ** Vars
	const { skin } = settings;

	const {
		setValue,
		watch,
		control,
		setError,
		handleSubmit,
		formState: { errors }
	} = useForm({
		defaultValues,
		mode: 'onSubmit',
		resolver: yupResolver(schema)
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		const { email, password, recaptchaToken } = data;
		await auth.login(
			{ email, password, rememberMe, recaptchaToken },
			e => {
				if (isAxiosError(e) && e.response?.data.message) {
					if (!Array.isArray(e.response.data.message)) {
						setError('email', {
							type: 'manual',
							message: e.response.data.message
						});
					} else {
						e.response.data.message.map((err: string) => toast.error(err));
					}
				}
			},
			(code?: string) => {
				setOpen(true);
				setCode(code || null);
			}
		);
		setIsLoading(false);
	};

	const handleOnClose = () => {
		setOpen(false);
		setCode(null);
		setErrorTwoFactor(null);
	};

	const handleOnConfirm = async (code: string) => {
		await auth.loginByTwoFactor({ twoFactorAuthenticationCode: code }, () => {
			setErrorTwoFactor('Неправильно Wrong2FA код');
		});
	};

	return (
		<GoogleReCaptchaProvider reCaptchaKey={authConfig.siteKey}>
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
									<Translations text='Welcome' locale='common' /> 👋🏻
								</TypographyStyled>
								<Typography variant='body2'>
									<Translations text='LoginHello' locale='common' />
								</Typography>
							</Box>

							<form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
								<FormControl fullWidth sx={{ mb: 4 }}>
									<Controller
										name='email'
										control={control}
										rules={{ required: true }}
										render={({ field: { value, onChange, onBlur } }) => (
											<TextField
												autoFocus
												label='E-mail'
												value={value}
												onBlur={onBlur}
												onChange={onChange}
												error={Boolean(errors.email)}
											/>
										)}
									/>
									{errors.email && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{errors.email.message}
										</FormHelperText>
									)}
								</FormControl>
								<FormControl fullWidth>
									<InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
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
												label={<Translations text='Password' locale='labels' />}
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
																	showPassword
																		? 'mdi:eye-outline'
																		: 'mdi:eye-off-outline'
																}
																fontSize={20}
															/>
														</IconButton>
													</InputAdornment>
												}
											/>
										)}
									/>
									{errors.password && (
										<FormHelperText sx={{ color: 'error.main' }} id=''>
											{errors.password.message}
										</FormHelperText>
									)}
								</FormControl>
								<Box
									sx={{
										mb: 4,
										display: 'flex',
										alignItems: 'center',
										flexWrap: 'wrap',
										justifyContent: 'space-between'
									}}
								>
									<FormControlLabel
										label={<Translations text='RememberMe' locale='common' />}
										control={
											<Checkbox
												checked={rememberMe}
												onChange={e => setRememberMe(e.target.checked)}
											/>
										}
									/>
									<LinkStyled href='/forgot-password'>
										<Translations text='ForgotPasswordQestionmark' locale='common' />
									</LinkStyled>
								</Box>
								<ReCaptchaHandler setValue={setValue} />
								<Button
									fullWidth
									size='large'
									variant={isLoading ? 'outlined' : 'contained'}
									sx={{ mb: 7 }}
									type='submit'
									disabled={!watch('recaptchaToken')}
								>
									{isLoading ? (
										<CircularProgress size={26} />
									) : (
										<Translations text='SignIn' locale='buttons' />
									)}
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
										<Translations text='FirstTime' locale='common' />{' '}
										<LinkStyled href='/register'>
											<Translations text='CreateAccount' locale='common' />
										</LinkStyled>
									</Typography>
								</Box>
							</form>
						</BoxWrapper>
					</Box>
				</RightWrapper>
				<DialogSendCode
					open={open}
					setIsClose={handleOnClose}
					code={code}
					error={errorTwoFactor}
					onConfirm={handleOnConfirm}
				/>
			</Box>
		</GoogleReCaptchaProvider>
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

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;
LoginPage.guestGuard = true;
export default LoginPage;

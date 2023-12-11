// ** React Imports
import { ReactNode, useState } from 'react';

// ** Next Import
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Components
import Button from '@mui/material/Button';
import Box, { BoxProps } from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import Typography, { TypographyProps } from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Configs
import authConfig from 'src/configs/auth';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';

// ** Utils
import axios from 'axios';
import { toast } from 'react-hot-toast';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

// Styled Components
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

const LinkStyledLogo = styled(Link)(() => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none'
}));

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
	fontWeight: 600,
	marginBottom: theme.spacing(1.5),
	[theme.breakpoints.down('md')]: { mt: theme.spacing(8) }
}));

const ResetPassword = () => {
	const router = useRouter();
	const theme = useTheme();
	const { t } = useTranslation('common');
	const { settings } = useSettings();
	const hidden = useMediaQuery(theme.breakpoints.down('md'));

	const [showPassword, setShowPassword] = useState<boolean>(false);

	// ** Vars
	const { skin } = settings;

	skin === 'bordered' ? 'auth-v2-forgot-password-illustration-bordered' : 'auth-v2-forgot-password-illustration';

	const resetForm = useForm({
		defaultValues: {
			password: ''
		}
	});

	const onSubmitPhone = async (data: { password: string }) => {
		const hash = router.query.hash;
		if (!!hash) {
			try {
				const resData = await axios.post(`${authConfig.baseApiUrl}/auth/reset/password`, {
					password: data.password,
					hash
				});
				if (resData.status == 200 || resData.status == 201) {
					router.push('/login');
					toast.success(`${t('PasswordResetSuccess')}`, { position: 'bottom-center', duration: 10000 });
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					if (!!error.response?.data.message) {
						const err = error.response?.data.message;
						if (Array.isArray(err)) {
							err.map(e => toast.error(e));
						} else {
							toast.error(err);
						}
					} else {
						toast.error(`${t('ServerError')}`, { position: 'bottom-right' });
					}
				}
			}
		} else {
			router.push('/login');
			toast.success(`${t('PasswordResetWrongLink')}`, {
				position: 'bottom-center',
				duration: 10000
			});
		}
	};

	return (
		<Box className='content-center'>
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
							<TypographyStyled variant='h5' sx={{ textAlign: 'center' }}>
								<Translations text='PasswordReset' locale='common' /> 🤫
							</TypographyStyled>
							<Typography variant='body2' sx={{ textAlign: 'center' }}>
								<Translations text='EnterNewPassword' locale='common' />
							</Typography>
						</Box>
						<form onSubmit={resetForm.handleSubmit(onSubmitPhone)}>
							<FormControl fullWidth>
								<InputLabel
									htmlFor='auth-login-v2-password'
									error={Boolean(resetForm.formState.errors.password)}
								>
									<Translations text='newPassword' locale='labels' />
								</InputLabel>
								<Controller
									name='password'
									rules={{
										required: `${t('required')}`
									}}
									control={resetForm.control}
									render={({ field, fieldState }) => (
										<OutlinedInput
											{...field}
											label={<Translations text='newPassword' locale='labels' />}
											error={Boolean(fieldState.invalid)}
											type={showPassword ? 'text' : 'password'}
											id='auth-login-v2-password'
											fullWidth
											sx={{ mb: 5.25 }}
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
															fontSize={20}
														/>
													</IconButton>
												</InputAdornment>
											}
										/>
									)}
								/>
								{resetForm.formState.errors.password && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{resetForm.formState.errors.password.message}
									</FormHelperText>
								)}
							</FormControl>
							<Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
								<Translations text='ResetPassword' locale='buttons' />
							</Button>
						</form>
					</BoxWrapper>
				</Box>
			</RightWrapper>
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

ResetPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;
ResetPassword.guestGuard = true;
export default ResetPassword;

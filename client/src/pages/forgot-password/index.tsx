// ** React Imports
import { ReactNode } from 'react';

// ** Next Import
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Components
import Button from '@mui/material/Button';
import Box, { BoxProps } from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { TextField } from '@mui/material';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Configs
import authConfig from 'src/configs/auth';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import * as cookie from 'cookie';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next/types';
import Translations from 'src/layouts/components/Translations';

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

const LinkStyled = styled(Link)(({ theme }) => ({
	display: 'flex',
	fontSize: '0.875rem',
	alignItems: 'center',
	textDecoration: 'none',
	justifyContent: 'center',
	color: theme.palette.primary.main
}));

const ForgotPassword = () => {
	// ** Hooks
	const { t } = useTranslation('common');
	const theme = useTheme();
	const { settings } = useSettings();
	const { control, handleSubmit } = useForm({
		defaultValues: {
			email: ''
		}
	});

	// ** Vars
	const { skin } = settings;
	const hidden = useMediaQuery(theme.breakpoints.down('md'));

	const onSubmitPhone = async (data: { email: string; code?: string; password?: string }) => {
		try {
			const resData = await axios.post<{ userId: string; code?: string }>(
				`${authConfig.baseApiUrl}/auth/forgot/password`,
				{
					email: data.email
				}
			);
			if (resData.data?.code) {
			} else if (resData.status === 201) {
				toast.success(`${t('RestorePassEmailSend')}`, { duration: 10000 });
			}
		} catch (err: any) {
			if (err.response.status === 400) {
				if (err.response.data.message) {
					if (Array.isArray(err.response.data.message)) {
						err.response.data.message.map((mes: string) => toast.error(mes));
					} else {
						toast.error(err.response.data.message);
					}
				} else {
					toast.error(`${t('ServerError')}`, { position: 'bottom-right' });
				}
			}
			if (err.response.status === 422) {
				toast.error(`${t('NonExistingEmail')}`);
			}
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
							<TypographyStyled variant='h5'>
								<Translations text='ForgotPasswordQestionmark' locale='common' /> 🔒
							</TypographyStyled>
							<Typography variant='body2'>
								<Translations text='ForgotPasswordDescription' locale='common' />
							</Typography>
						</Box>
						<form onSubmit={handleSubmit(onSubmitPhone)}>
							<Controller
								name='email'
								control={control}
								render={({ field }) => (
									<TextField
										sx={{ display: 'flex', mb: 4 }}
										{...field}
										required
										label='E-mail'
										placeholder='mail@mail.ru'
										autoFocus
									/>

									// <MuiTelInput
									// 	sx={{ display: 'flex', mb: 4 }}
									// 	{...field}
									// 	forceCallingCode
									// 	defaultCountry='RU'
									// 	autoFocus
									// 	helperText={fieldState.invalid ? 'Неправильный номер телефона' : ''}
									// 	error={fieldState.invalid}
									// />
								)}
							/>
							<Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
								<Translations text='RestorePassword' locale='buttons' />
							</Button>

							<Typography
								variant='body2'
								sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
							>
								<LinkStyled href='/login'>
									<Icon icon='mdi:chevron-left' />
									<span>
										<Translations text='GoBackToLogin' locale='common' />
									</span>
								</LinkStyled>
							</Typography>
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

ForgotPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;
ForgotPassword.guestGuard = true;
export default ForgotPassword;

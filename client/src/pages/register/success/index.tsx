// ** Next Import
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

import { ReactNode } from 'react';

// ** MUI Imports
import { styled, useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography, { TypographyProps } from '@mui/material/Typography';

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as cookie from 'cookie';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';
import { Button } from '@mui/material';
import axios, { isAxiosError } from 'axios';
import auth from 'src/configs/auth';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
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

const RegisterSucces = () => {
	const router = useRouter();
	const theme = useTheme();
	const { settings } = useSettings();
	const { t } = useTranslation('common');
	const hidden = useMediaQuery(theme.breakpoints.down('md'));
	const { skin } = settings;

	const resendConfirmEmail = async () => {
		try {
			const res = await axios.post(`${auth.baseApiUrl}/auth/resend-confirm-email`, { email: router.query.email });
			if (res.status === 201) {
				toast.success(`${t('EmailSent')}`);
			}
		} catch (e) {
			if (isAxiosError(e) && e.response?.data.message) {
				const error = e.response?.data.message;
				if (Array.isArray(error)) {
					error.map(err => toast.error(err));
				} else {
					toast.error(error);
				}
			}
		}
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
								mb: 10
							}}
						>
							<LinkStyledLogo href='/'>
								<Image alt='logo' src='/images/logo.svg' width={180} height={16} />
							</LinkStyledLogo>
						</Box>
						<Box sx={{ mb: 10 }}>
							<TypographyStyled variant='h5' sx={{ textAlign: 'center', mb: 4 }}>
								<Translations text='RegisterSuccess' locale='common' />
							</TypographyStyled>
							<Typography variant='body1' sx={{ textAlign: 'center' }}>
								<Translations text='EmailWillSentOn' locale='common' /> <b>{router.query.email}</b>
							</Typography>
						</Box>
						<Box>
							<Typography variant='body2' sx={{ textAlign: 'center' }}>
								<Translations text='EmailDidntArrive' locale='common' />{' '}
								<Button variant='text' onClick={resendConfirmEmail}>
									<Translations text='SendAgain' locale='buttons' />
								</Button>
							</Typography>
						</Box>
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

RegisterSucces.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;
RegisterSucces.guestGuard = true;
export default RegisterSucces;

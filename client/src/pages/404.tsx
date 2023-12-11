// ** React Imports
import { ReactNode } from 'react';

// ** Next Import
import Link from 'next/link';

// ** MUI Components
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	[theme.breakpoints.down('md')]: {
		width: '90vw'
	}
}));

const Img = styled('img')(({ theme }) => ({
	marginBottom: theme.spacing(10),
	[theme.breakpoints.down('lg')]: {
		height: 450,
		marginTop: theme.spacing(10)
	},
	[theme.breakpoints.down('md')]: {
		height: 400
	},
	[theme.breakpoints.up('lg')]: {
		marginTop: theme.spacing(13)
	}
}));

const Error404 = () => {
	return (
		<Box className='content-center'>
			<Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
				<BoxWrapper>
					<Typography variant='h1' sx={{ mb: 4 }}>
						404
					</Typography>
					<Typography variant='h5' sx={{ mb: 2, fontSize: '1.5rem !important' }}>
						Страница не найдена⚠️
					</Typography>
					<Typography variant='body2'>Мы не можем найти ту страницу которую вы искали</Typography>
				</BoxWrapper>
				<Img
					sx={{ maxWidth: '27.875rem', width: '100%', height: 'auto!important' }}
					alt='error-illustration'
					src='/images/coins.png'
				/>
				<Button href='/' component={Link} variant='contained' sx={{ px: 5.5 }}>
					Вернуться на главную
				</Button>
			</Box>
		</Box>
	);
};

Error404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default Error404;

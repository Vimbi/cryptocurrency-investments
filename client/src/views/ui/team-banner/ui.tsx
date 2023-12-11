import { Typography, Button, ButtonProps, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { common, grey } from '@mui/material/colors';
import { FC } from 'react';
import Translations from 'src/layouts/components/Translations';

const CustomButton = styled(Button)<ButtonProps>(() => ({
	backgroundColor: common.white,
	color: '#16642F',
	'&:hover': {
		backgroundColor: grey[300]
	}
}));

interface Banner {
	onClick?: () => void;
}

export const TeamAdvertisingBanner: FC<Banner> = ({ onClick }) => {
	return (
		<Box>
			<Box
				className='teamAdvertisingBanner'
				sx={{
					backgroundImage: 'linear-gradient(92deg, #258343 0%, #16642F 100%)',
					display: 'grid',
					gridTemplateColumns: '1fr',
					gap: 8,
					justifyItems: 'center',
					py: { xs: 10, sm: 15 },
					borderRadius: '.5rem'
				}}
			>
				<Typography
					sx={{ width: { xs: '98%', sm: '70%', lg: '60%' }, textAlign: 'center' }}
					color='white'
					variant='h4'
				>
					<Translations text='TeamAdvertisingBanner' locale='main' />
				</Typography>
				<CustomButton sx={{ width: 'fit-content' }} variant='contained' onClick={onClick}>
					<Translations text='JoinTheTeam' locale='buttons' />
				</CustomButton>
			</Box>
		</Box>
	);
};

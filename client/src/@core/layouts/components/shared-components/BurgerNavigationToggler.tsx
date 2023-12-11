import { ElementType, FC } from 'react';

import { styled } from '@mui/material/styles';

import MuiListItem, { ListItemProps } from '@mui/material/ListItem';

import { hexToRGBA } from 'src/@core/utils/hex-to-rgba';

import { Button, Box, ListItemIcon } from '@mui/material';

import UserIcon from 'src/layouts/components/UserIcon';

const ListItem = styled(MuiListItem)<ListItemProps & { component?: ElementType }>(({ theme }) => ({
	width: 'auto',
	paddingTop: theme.spacing(2.25),
	color: theme.palette.text.primary,
	paddingBottom: theme.spacing(2.25),
	'&:hover': {
		backgroundColor: theme.palette.action.hover
	},
	'&.active, &.active:hover': {
		backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08)
	},
	'&.active .MuiTypography-root, &.active .MuiListItemIcon-root': {
		color: theme.palette.primary.main
	},
	'&:focus-visible': {
		outline: 0,
		backgroundColor: theme.palette.action.focus
	}
}));

interface Props {
	isActive: boolean;
	setIsActive: (value: boolean) => void;
}

const BurgerNavigationToggler: FC<Props> = ({ isActive, setIsActive }) => {
	const icon = isActive ? 'mdi-menu' : 'mdi-close';

	return (
		<ListItem component={Button} sx={{ px: 5 }} onClick={() => setIsActive(!isActive)}>
			<Box
				sx={{
					width: 'auto',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}
			>
				<ListItemIcon sx={{ color: 'text.primary', width: 'auto' }}>
					<UserIcon icon={icon} fontSize='1.375rem' />
				</ListItemIcon>
			</Box>
		</ListItem>
	);
};

export default BurgerNavigationToggler;

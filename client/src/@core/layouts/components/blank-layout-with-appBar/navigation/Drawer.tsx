// ** MUI Imports
import { styled, useTheme } from '@mui/material/styles';
import MuiSwipeableDrawer, { SwipeableDrawerProps } from '@mui/material/SwipeableDrawer';

// ** Type Import
import { GuestLayoutProps } from 'src/@core/layouts/types';

interface Props {
	navWidth: number | string;
	navHover: boolean;
	navVisible: boolean;
	collapsedNavWidth: number;
	navigationBorderWidth: number;
	hidden: GuestLayoutProps['hidden'];
	settings: GuestLayoutProps['settings'];
	children: GuestLayoutProps['children'];
	setNavHover: (values: boolean) => void;
	setNavVisible: (value: boolean) => void;
}

const SwipeableDrawer = styled(MuiSwipeableDrawer)<SwipeableDrawerProps>({
	overflowX: 'hidden',
	transition: 'width .25s ease-in-out',
	'& ul': {
		listStyle: 'none'
	},
	'& .MuiListItem-gutters': {
		paddingLeft: 4,
		paddingRight: 4
	},
	'& .MuiDrawer-paper': {
		top: '',
		paddingLeft: 4,
		paddingRight: 4,
		overflowX: 'hidden',
		transition: 'width .25s ease-in-out, box-shadow .25s ease-in-out'
	}
});

const Drawer = (props: Props) => {
	// ** Props
	const {
		hidden,
		children,
		navHover,
		navWidth,
		settings,
		navVisible,
		setNavVisible,
		collapsedNavWidth,
		navigationBorderWidth
	} = props;

	// ** Hook
	const theme = useTheme();

	// ** Vars
	const { navCollapsed } = settings;

	// Drawer Props for Mobile & Tablet screens
	const MobileDrawerProps = {
		open: navVisible,
		onOpen: () => setNavVisible(true),
		onClose: () => setNavVisible(false),
		ModalProps: {
			keepMounted: true // Better open performance on mobile.
		}
	};

	return (
		<SwipeableDrawer
			className='layout-vertical-nav'
			variant='temporary'
			anchor='top'
			{...{ ...MobileDrawerProps }}
			PaperProps={{
				sx: {
					backgroundColor: 'background.paper',
					width: '100%',
					...(!hidden && navCollapsed && navHover ? { boxShadow: 9 } : {}),
					borderRight:
						navigationBorderWidth === 0 ? 0 : `${navigationBorderWidth}px solid ${theme.palette.divider}`,
					top: theme => `${theme.mixins.toolbar.minHeight as number}px !important`
				}
			}}
			BackdropProps={{
				sx: {
					top: theme => `${theme.mixins.toolbar.minHeight as number}px !important`
				}
			}}
			sx={{
				width: navCollapsed ? collapsedNavWidth : navWidth
			}}
		>
			{children}
		</SwipeableDrawer>
	);
};

export default Drawer;

// ** Next Import
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Imports
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// ** Type Import
import { GuestLayoutProps, NavLink } from 'src/@core/layouts/types';

// ** Theme Config Import
import Navigation from './navigation';

interface Props {
	hidden: GuestLayoutProps['hidden'];
	settings: GuestLayoutProps['settings'];
	saveSettings: GuestLayoutProps['saveSettings'];
	appBarContent: NonNullable<NonNullable<GuestLayoutProps['layoutProps']>['appBar']>['content'];
	navItems?: NavLink[];
	toggleNavVisibility: () => void;
	navVisible?: boolean;
}

const LinkStyled = styled(Link)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none',
	marginRight: theme.spacing(0)
}));

const AppBarContent = (props: Props) => {
	// ** Props
	const { appBarContent: blankAppBarContent, navItems, hidden } = props;

	return (
		<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<LinkStyled href='/'>
				<Image alt='logo' src='/images/logo.svg' width={160} height={14} />
				{/* {themeConfig.templateName} */}
			</LinkStyled>
			{!hidden && <Navigation navItems={navItems} {...props} />}
			{blankAppBarContent ? blankAppBarContent(props) : null}
		</Box>
	);
};

export default AppBarContent;

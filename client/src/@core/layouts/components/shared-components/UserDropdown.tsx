// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** MUI Imports
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Context
import { useAuth } from 'src/hooks/useAuth';

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext';
import { UsersType } from 'src/types/apps/userTypes';
import Link from 'next/link';
import Translations from 'src/layouts/components/Translations';

interface Props {
	user?: UsersType;
	settings: Settings;
	children?: React.ReactNode;
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
	width: 8,
	height: 8,
	borderRadius: '50%',
	backgroundColor: theme.palette.success.main,
	boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}));

const LinkStyled = styled(Link)({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none'
});

const UserDropdown = (props: Props) => {
	// ** Props
	const { settings, user, children } = props;

	// ** States
	const [anchorEl, setAnchorEl] = useState<Element | null>(null);

	// ** Hooks
	const router = useRouter();
	const { logout } = useAuth();

	// ** Vars
	const { direction } = settings;

	const handleDropdownOpen = (event: SyntheticEvent) => {
		setAnchorEl(event.currentTarget);
	};

	const handleDropdownClose = (url?: string) => {
		if (url) {
			router.push(url);
		}
		setAnchorEl(null);
	};

	const handleMenuClick = (url: string) => {
		if (url) {
			router.push(url);
		}
		setAnchorEl(null);
	};

	const handleLogout = () => {
		logout();
		handleDropdownClose();
	};

	const isAdmin = !!user && (user.role?.name === 'admin' || user.role?.name === 'super_admin');

	return (
		<Fragment>
			<Badge
				overlap='circular'
				onClick={handleDropdownOpen}
				sx={{ ml: 2, cursor: 'pointer' }}
				badgeContent={<BadgeContentSpan />}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
			>
				<Avatar
					alt='John Doe'
					onClick={handleDropdownOpen}
					sx={{ width: 40, height: 40 }}
					src={user?.photo && user.photo.path ? user.photo.path : '/images/avatars/1.png'}
				/>
			</Badge>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleDropdownClose()}
				sx={{ '& .MuiMenu-paper': { width: 300, mt: 4 } }}
				anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
			>
				<Box sx={{ pt: 2, pb: 3, px: 4 }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<Badge
							overlap='circular'
							badgeContent={<BadgeContentSpan />}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right'
							}}
						>
							<Avatar
								alt='John Doe'
								src={user?.photo && user.photo.path ? user.photo.path : '/images/avatars/1.png'}
								sx={{ width: '2.5rem', height: '2.5rem' }}
							/>
						</Badge>
						<Box sx={{ display: 'flex', ml: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
							<LinkStyled href='/apps/profile/account'>
								<Typography
									sx={{ fontWeight: 600 }}
								>{`${user?.firstName} ${user?.lastName}`}</Typography>
							</LinkStyled>
							<Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
								{user?.email}
							</Typography>
						</Box>
					</Box>
				</Box>
				{!!children && (
					<>
						<Divider sx={{ mt: '0 !important' }} />
						<Box sx={{ py: 2, px: 'calc(1rem - 6px)' }}>{children}</Box>
					</>
				)}
				<Divider sx={{ mt: '0 !important' }} />
				<MenuItem
					sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
					onClick={() => handleMenuClick('/apps/profile/create-deposit')}
				>
					<Icon icon='mdi:cash-plus' />
					<Translations text='Replenishment' locale='navigation' />
				</MenuItem>
				<MenuItem
					sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
					onClick={() => handleMenuClick('/apps/profile/create-withdrawal')}
				>
					<Icon icon='mdi:cash-refund' />
					<Translations text='Withdrawal' locale='navigation' />
				</MenuItem>
				<MenuItem
					sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
					onClick={() => handleMenuClick('/apps/profile/transit-transfer')}
				>
					<Icon icon='mdi:transit-transfer' />
					<Translations text='TransferToUser' locale='navigation' />
				</MenuItem>
				{isAdmin && (
					<>
						<Divider sx={{ mt: '0 !important' }} />
						<MenuItem
							sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
							onClick={() => handleMenuClick('/apps/profile/investment')}
						>
							<Icon icon='mdi:currency-usd' />
							<Translations text='MyInvestments' locale='navigation' />
						</MenuItem>
						<MenuItem
							sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
							onClick={() => handleMenuClick('/apps/profile/accruals')}
						>
							<Icon icon='mdi:chart-waterfall' />
							<Translations text='Accruals' locale='navigation' />
						</MenuItem>
						<MenuItem
							sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
							onClick={() => handleMenuClick('/apps/profile/team')}
						>
							<Icon icon='mdi:account-multiple' />
							<Translations text='MyTeam' locale='navigation' />
						</MenuItem>
						<MenuItem
							sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
							onClick={() => handleMenuClick('/apps/profile/transfers')}
						>
							<Icon icon='mdi:history' />
							<Translations text='History' locale='navigation' />
						</MenuItem>
						<Divider sx={{ mt: '0 !important' }} />
					</>
				)}
				<MenuItem
					onClick={handleLogout}
					sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
				>
					<Icon icon='mdi:logout-variant' />
					<Translations text='Logout' locale='navigation' />
				</MenuItem>
			</Menu>
		</Fragment>
	);
};

export default UserDropdown;

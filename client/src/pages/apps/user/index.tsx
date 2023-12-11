// ** React Imports
import { useState, useEffect, MouseEvent, useTransition } from 'react';

// ** Next Imports
import Link from 'next/link';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar';

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials';
import useTimeout from 'src/hooks/useTimeout';
import * as cookie from 'cookie';

// ** Actions Imports
import { fetchData } from 'src/store/apps/user';

// import toast from 'react-hot-toast';
// ** Third Party Components

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { UsersType } from 'src/types/apps/userTypes';

// ** Custom Table Components Imports
// import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer';

// ** For get TokenVariable
import useComponentDidMount from 'src/hooks/useComponentDidMount';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import AllUsers from 'src/views/pages/profile/team/card/AllUsers';

interface UserRoleType {
	[key: string]: { icon: string; color: string };
}

// interface UserStatusType {
//   [key: string]: ThemeColor
// }

// ** Vars
const userRoleObj: UserRoleType = {
	super_admin: { icon: 'mdi:laptop', color: 'error.main' },
	admin: { icon: 'mdi:cog-outline', color: 'warning.main' },
	editor: { icon: 'mdi:pencil-outline', color: 'info.main' },
	maintainer: { icon: 'mdi:chart-donut', color: 'success.main' },
	user: { icon: 'mdi:account-outline', color: 'primary.main' }
};

// interface CellType {
// 	row: UsersType;
// }

type UserExtend = UsersType | Record<string, any>;

// const userStatusObj: UserStatusType = {
//   active: 'success',
//   pending: 'warning',
//   inactive: 'secondary'
// }

const LinkStyled = styled(Link)(({ theme }) => ({
	fontWeight: 600,
	fontSize: '1rem',
	cursor: 'pointer',
	textDecoration: 'none',
	color: theme.palette.text.secondary,
	'&:hover': {
		color: theme.palette.primary.main
	}
}));

// ** renders client column
const renderClient = (row: UserExtend) => {
	if (row.avatar) {
		return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 30, height: 30 }} />;
	} else {
		return (
			<CustomAvatar
				skin='light'
				color={row.avatarColor || 'primary'}
				sx={{ mr: 3, width: 30, height: 30, fontSize: '.875rem' }}
			>
				{getInitials(row.firstName ? row.firstName : 'FDI')}
			</CustomAvatar>
		);
	}
};

const UserList = () => {
	// const isSuperAdmin = auth.user?.role?.name === 'super_admin';
	const { t } = useTranslation('labels');

	const gridCols: GridColDef[] = [
		{
			field: 'firstName',
			headerName: `${t('fio')}`,
			sortable: false,
			flex: 0.3,
			minWidth: 150,
			renderCell: ({ row }: { row: UserExtend }) => {
				const { firstName, lastName, id } = row;
				const displayName = `${firstName} ${lastName}`;

				return (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{renderClient(row)}
						<LinkStyled href={`/apps/user/view/${id}`}>{displayName}</LinkStyled>
					</Box>
				);
			}
		},
		{
			field: 'email',
			headerName: 'E-mail',
			sortable: false,
			flex: 0.3,
			minWidth: 150,
			renderCell: ({ row }: { row: UserExtend }) => {
				return (
					<Typography noWrap variant='body2'>
						{row.email}
					</Typography>
				);
			}
		},
		{
			field: 'phone',
			headerName: `${t('phone')}`,
			sortable: false,
			flex: 0.2,
			minWidth: 100,
			renderCell: ({ row }: { row: UserExtend }) => {
				return (
					<Typography noWrap variant='body2'>
						{row.phone}
					</Typography>
				);
			}
		},
		{
			field: 'role',
			headerName: `${t('role')}`,
			sortable: false,
			flex: 0.15,
			minWidth: 100,
			renderCell: ({ row }: { row: UserExtend }) => {
				return (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							'& svg': { mr: 3, color: userRoleObj[`${row.role?.name}`]?.color || 'white' }
						}}
					>
						<Icon icon={userRoleObj[`${row.role?.name}`].icon} fontSize={20} />
						<Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
							{row.role?.name}
						</Typography>
					</Box>
				);
			}
		},
		{
			field: 'createdAt',
			headerName: `${t('registerDate')}`,
			sortable: false,
			flex: 0.05,
			minWidth: 170,
			renderCell: ({ row }: { row: UserExtend }) => {
				return (
					<Typography variant='body2'>
						{row.createdAt
							? new Date(row.createdAt).toLocaleDateString('ru-RU', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
							  })
							: ''}
					</Typography>
				);
			}
		},
		{
			width: 55,
			sortable: false,
			field: 'actions',
			headerName: 'actions',
			headerAlign: 'right',
			renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
			renderCell: ({ row }: { row: UserExtend }) => <RowOptions id={row.id} />
		}
	];

	const RowOptions = ({ id }: { id: number | string }) => {
		// ** Hooks
		// const dispatch = useDispatch<AppDispatch>();

		// ** State
		// const userRole = auth.user?.role;
		// const auth = useAuth();
		const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
		const rowOptionsOpen = Boolean(anchorEl);

		const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
			setAnchorEl(event.currentTarget);
		};
		const handleRowOptionsClose = () => {
			setAnchorEl(null);
		};

		// const editUserActions = async (boolean: boolean, action: string) => {
		// 	const resData = await dispatch(
		// 		updateUser({ userId: `${id}`, role: userRole?.name, action, [`${action}`]: boolean })
		// 	);
		// 	if (resData.payload === 200) {
		// 		toast.success(
		// 			boolean
		// 				? action === 'block'
		// 					? 'Пользователь заблокирован'
		// 					: 'Действия пользователя ограничены'
		// 				: action === 'block'
		// 				? 'Пользователь разблокирован'
		// 				: 'Действия пользователя восстановлены'
		// 		);
		// 		handleRowOptionsClose();
		// 	} else {
		// 		toast.error('Ошибка');
		// 	}
		// };

		// const handleBlock = (action: 'block' | 'restrict') => {
		// 	if (action === 'block') {
		// 		if (isBlocked) {
		// 			editUserActions(false, action);
		// 		} else {
		// 			editUserActions(true, action);
		// 		}
		// 	} else {
		// 		if (restricted) {
		// 			editUserActions(false, action);
		// 		} else {
		// 			editUserActions(true, action);
		// 		}
		// 	}
		// };
		// const date = new Date(restricted!);
		// const formattedDate = date.toLocaleString();

		return (
			<>
				<IconButton size='small' onClick={handleRowOptionsClick}>
					<Icon icon='mdi:dots-vertical' />
				</IconButton>
				<Menu
					keepMounted
					anchorEl={anchorEl}
					open={rowOptionsOpen}
					onClose={handleRowOptionsClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right'
					}}
					PaperProps={{ style: { minWidth: '8rem' } }}
				>
					<MenuItem
						onClick={() => {
							setChildId(`${id}`);
						}}
						sx={{ '& svg': { mr: 2 } }}
					>
						<Icon color={'primary.main'} icon='mdi:account-group' fontSize={20} />
						<Translations text='team.show' locale='buttons' />
					</MenuItem>

					{/* <MenuItem
						component='a'
						href={`${authConfig.baseDomainUrl}/profile/${id}`}
						target='_blank'
						sx={{ '& svg': { mr: 2 } }}
					>
						<Icon color={'primary.main'} icon='mdi:account-box-outline' fontSize={20} />
						Профиль FarmDepo
						<Icon style={{ marginLeft: '.5rem' }} color={'primary.main'} icon='mdi:open-in-new' fontSize={16} />
					</MenuItem>
					<MenuItem onClick={() => handleBlock('block')} sx={{ '& svg': { mr: 2 } }}>
						<Icon color={'primary.main'} icon={isBlocked ? 'mdi:security' : 'mdi:block-helper'} fontSize={20} />
						{isBlocked ? 'Разблокировать' : 'Заблокировать'}
					</MenuItem>
					<MenuItem onClick={() => handleBlock('restrict')} sx={{ '& svg': { mr: 2 } }}>
						<Icon color={'primary.main'} icon={restricted ? 'mdi:clock-outline' : 'mdi:volume-off'} fontSize={20} />
						{restricted ? `До ${formattedDate}` : 'Заглушить на 2 дня'}
					</MenuItem> */}
				</Menu>
			</>
		);
	};

	// ** State
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);

	// const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
	const [isPending, startTransition] = useTransition();
	const [childId, setChildId] = useState<string>();
	const [idFilter, setIdFilter] = useState<string>();
	const [firstName, setFirstName] = useState<string>();
	const [lastName, setLastName] = useState<string>();
	const [email, setEmail] = useState<string>();

	// ** Hooks
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.user);
	const timeout = useTimeout(1000);
	const isMounted = useComponentDidMount();
	const fetchDataTable = () => {
		startTransition(() => {
			dispatch(
				fetchData({
					limit: pageSize,
					page: currentPage + 1,
					userId: idFilter,
					firstName,
					lastName,
					childId,
					email
				})
			);
		});
	};
	useEffect(() => {
		fetchDataTable();
	}, [currentPage, pageSize, childId]);
	useEffect(() => {
		if (isMounted) {
			timeout(() => {
				fetchDataTable();
			});
		}
	}, [idFilter, firstName, lastName, email]);

	return (
		<Grid container spacing={6}>
			<Grid
				item
				xs={12}
				sx={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2,fit-content(100%))',
					justifyContent: 'end',
					gridGap: '1.5rem',
					textAlign: 'right'
				}}
			>
				{childId ? (
					<Button onClick={() => setChildId('')} color='error' variant='outlined'>
						<Translations text='team.cancel' locale='buttons' />
					</Button>
				) : null}
			</Grid>
			<Grid item xs={12}>
				<Card>
					<CardHeader title={<Translations text='Clients' locale='navigation' />} action={<AllUsers />} />
					<CardContent>
						<Grid container spacing={6}>
							<Grid item sm={3} xs={12}>
								<TextField
									size='small'
									fullWidth
									label='ID'
									value={idFilter}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setIdFilter(event.target.value);
									}}
								/>
							</Grid>
							<Grid item sm={3} xs={12}>
								<TextField
									size='small'
									fullWidth
									label={<Translations text='name' locale='labels' />}
									value={firstName}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setFirstName(event.target.value);
									}}
								/>
							</Grid>
							<Grid item sm={3} xs={12}>
								<TextField
									size='small'
									fullWidth
									label={<Translations text='surname' locale='labels' />}
									value={lastName}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setLastName(event.target.value);
									}}
								/>
							</Grid>
							<Grid item sm={3} xs={12}>
								<TextField
									size='small'
									fullWidth
									label='E-mail'
									value={email}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setEmail(event.target.value);
									}}
								/>
							</Grid>
						</Grid>
					</CardContent>
					<Divider />
					<DataGrid
						paginationMode='server'
						loading={isPending}
						autoHeight
						rows={store.data}
						rowCount={store.itemCount}
						columns={gridCols}
						pageSize={pageSize}
						page={currentPage}
						disableSelectionOnClick
						rowsPerPageOptions={[10, 25, 50]}
						onPageChange={e => setCurrentPage(e)}
						onPageSizeChange={(newPageSize: number) => {
							setPageSize(newPageSize);
						}}
						disableColumnMenu
					/>
				</Card>
			</Grid>
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};
export default UserList;

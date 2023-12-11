// ** React Imports
import { useState, useEffect, useTransition, ChangeEvent } from 'react';

// ** Next Imports
// import Link from 'next/link';

// ** MUI Imports
import Card from '@mui/material/Card';

// import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';

// import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// import { styled } from '@mui/material/styles';
// import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';

// ** Icon Imports
// import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Actions Imports
// import { updateUser } from 'src/store/apps/user';
import { fetchData, updateReferral } from 'src/store/apps/referrals';

// ** Third Party Components
// import { useAuth } from 'src/hooks/useAuth';
import toast from 'react-hot-toast';
import * as cookie from 'cookie';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';

// ** Custom Table Components Imports
// import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer';

// ** For get TokenVariable
// import authConfig from 'src/configs/auth';
import { ReferralType } from 'src/types/apps/referralType';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

// interface UserRoleType {
// 	[key: string]: { icon: string; color: string };
// }

// interface UserStatusType {
//   [key: string]: ThemeColor
// }

// ** Vars
// const userRoleObj: UserRoleType = {
// 	super_admin: { icon: 'mdi:laptop', color: 'error.main' },
// 	admin: { icon: 'mdi:cog-outline', color: 'warning.main' },
// 	editor: { icon: 'mdi:pencil-outline', color: 'info.main' },
// 	maintainer: { icon: 'mdi:chart-donut', color: 'success.main' },
// 	user: { icon: 'mdi:account-outline', color: 'primary.main' }
// };

interface CellType {
	row: ReferralType;
}

// const userStatusObj: UserStatusType = {
//   active: 'success',
//   pending: 'warning',
//   inactive: 'secondary'
// }

// const LinkStyled = styled(Link)(({ theme }) => ({
// 	fontWeight: 600,
// 	fontSize: '1rem',
// 	cursor: 'pointer',
// 	textDecoration: 'none',
// 	color: theme.palette.text.secondary,
// 	'&:hover': {
// 		color: theme.palette.primary.main
// 	}
// }));

// ** renders client column

// const RowOptions = ({
// 	id,
// 	isBlocked,
// 	restricted
// }: {
// 	id: number | string;
// 	isBlocked: boolean | null | undefined;
// 	restricted: string | null | undefined;
// }) => {
// 	// ** Hooks
// 	const dispatch = useDispatch<AppDispatch>();

// 	// ** State
// 	const auth = useAuth();
// 	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
// 	const userRole = auth.user?.role;
// 	const rowOptionsOpen = Boolean(anchorEl);

// 	const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
// 		setAnchorEl(event.currentTarget);
// 	};
// 	const handleRowOptionsClose = () => {
// 		setAnchorEl(null);
// 	};

// 	const editUserActions = async (boolean: boolean, action: string) => {
// 		const resData = await dispatch(
// 			updateUser({ userId: `${id}`, role: userRole?.name, action, [`${action}`]: boolean })
// 		);
// 		if (resData.payload === 200) {
// 			toast.success(
// 				boolean
// 					? action === 'block'
// 						? 'Пользователь заблокирован'
// 						: 'Действия пользователя ограничены'
// 					: action === 'block'
// 					? 'Пользователь разблокирован'
// 					: 'Действия пользователя восстановлены'
// 			);
// 			handleRowOptionsClose();
// 		} else {
// 			toast.error('Ошибка');
// 		}
// 	};

// 	const handleBlock = (action: 'block' | 'restrict') => {
// 		if (action === 'block') {
// 			if (isBlocked) {
// 				editUserActions(false, action);
// 			} else {
// 				editUserActions(true, action);
// 			}
// 		} else {
// 			if (restricted) {
// 				editUserActions(false, action);
// 			} else {
// 				editUserActions(true, action);
// 			}
// 		}
// 	};
// 	const date = new Date(restricted!);
// 	const formattedDate = date.toLocaleString();

// 	return (
// 		<>
// 			<IconButton size='small' onClick={handleRowOptionsClick}>
// 				<Icon icon='mdi:dots-vertical' />
// 			</IconButton>
// 			<Menu
// 				keepMounted
// 				anchorEl={anchorEl}
// 				open={rowOptionsOpen}
// 				onClose={handleRowOptionsClose}
// 				anchorOrigin={{
// 					vertical: 'bottom',
// 					horizontal: 'right'
// 				}}
// 				transformOrigin={{
// 					vertical: 'top',
// 					horizontal: 'right'
// 				}}
// 				PaperProps={{ style: { minWidth: '8rem' } }}
// 			>
// 				<MenuItem
// 					component='a'
// 					href={`${authConfig.baseDomainUrl}/profile/${id}`}
// 					target='_blank'
// 					sx={{ '& svg': { mr: 2 } }}
// 				>
// 					<Icon color={'primary.main'} icon='mdi:account-box-outline' fontSize={20} />
// 					Профиль FarmDepo
// 					<Icon style={{ marginLeft: '.5rem' }} color={'primary.main'} icon='mdi:open-in-new' fontSize={16} />
// 				</MenuItem>
// 				<MenuItem onClick={() => handleBlock('block')} sx={{ '& svg': { mr: 2 } }}>
// 					<Icon color={'primary.main'} icon={isBlocked ? 'mdi:security' : 'mdi:block-helper'} fontSize={20} />
// 					{isBlocked ? 'Разблокировать' : 'Заблокировать'}
// 				</MenuItem>
// 				<MenuItem onClick={() => handleBlock('restrict')} sx={{ '& svg': { mr: 2 } }}>
// 					<Icon color={'primary.main'} icon={restricted ? 'mdi:clock-outline' : 'mdi:volume-off'} fontSize={20} />
// 					{restricted ? `До ${formattedDate}` : 'Заглушить на 2 дня'}
// 				</MenuItem>
// 			</Menu>
// 		</>
// 	);
// };

const RowSwitch = ({ row }: CellType) => {
	const [checked, setChecked] = useState(!!row.status);
	const dispatch = useDispatch<AppDispatch>();
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const newVal = event.target.checked;
		setChecked(newVal);
		dispatch(updateReferral({ referrralLevelId: row.id, status: newVal }));
		if (newVal) {
			toast('Реферальный уровень включен', { icon: '😌' });
		} else {
			toast('Реферальный уровень выключен', { icon: '☹️' });
		}
	};

	return <Switch checked={checked} onChange={handleChange} />;
};

const Referals = () => {
	// ** State
	const [isPending, startTransition] = useTransition();

	// ** Hooks
	const { t } = useTranslation('labels');
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.referrals);

	useEffect(() => {
		startTransition(() => {
			dispatch(fetchData());
		});
	}, [dispatch]);

	const columns: GridColDef[] = [
		{
			width: 70,
			sortable: false,
			field: 'level',
			headerName: '№'
		},
		{
			flex: 0.1,
			sortable: false,
			field: 'percentage',
			headerName: `${t('percent')}`,
			renderCell: ({ row }: CellType) => {
				return (
					<Typography noWrap variant='body2'>
						{row.percentage} %
					</Typography>
				);
			}
		},
		{
			flex: 0.1,
			sortable: false,
			field: 'status',
			headerName: `${t('status')}`,
			renderCell: ({ row }: CellType) => {
				return <RowSwitch row={row} />;
			}
		}

		// {
		// 	flex: 0.05,
		// 	minWidth: 50,
		// 	sortable: false,
		// 	field: 'actions',
		// 	headerName: 'actions',
		// 	renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
		// 	renderCell: ({ row }: CellType) => (
		// 		<RowOptions isBlocked={row.isBanned} id={row.id!} restricted={row.restrictedUntil} />
		// 	)
		// }
	];

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader title={<Translations text='ReferralProgram' locale='navigation' />} />
					<CardContent>
						<DataGrid
							paginationMode='server'
							loading={isPending}
							autoHeight
							rows={store.levels}
							columns={columns}
							pageSize={10}
							hideFooter={true}
							disableSelectionOnClick
						/>
					</CardContent>
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

Referals.acl = {
	subject: 'referals',
	action: 'read'
};

export default Referals;

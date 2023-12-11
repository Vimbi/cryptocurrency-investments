// ** React / Next Imports
import { useState, useEffect, MouseEvent, useTransition, useMemo } from 'react';

// ** MUI Imports
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

// import CardContent from '@mui/material/CardContent';
// import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar';

// ** Utils Import
// import useTimeout from 'src/hooks/useTimeout';
import * as cookie from 'cookie';

// ** Actions Imports
import { deleteCurrencie, fetchData, setCurrentCurrencie } from 'src/store/apps/currencies';

// import toast from 'react-hot-toast';
// ** Third Party Components
// import { useAuth } from 'src/hooks/useAuth';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';

// import { UsersType } from 'src/types/apps/userTypes';

// ** Custom Table Components Imports
import CurrencyDrawer from 'src/views/apps/currency/CurrencyDrawer';

// ** For get TokenVariable
import { CurrencieType } from 'src/types/apps/currenciesType';
import { useAbility } from 'src/hooks/useAbility';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

// ** renders client column
const renderClient = (row: CurrencieType) => {
	return (
		<CustomAvatar
			skin='light'
			color={row.avatarColor || 'primary'}
			sx={{ mr: 3, width: 30, height: 30, fontSize: '.5rem' }}
		>
			{row.symbol}
		</CustomAvatar>
	);
};
interface CellType {
	row: CurrencieType;
}
const RowOptions = ({ row }: CellType) => {
	const [subDel, setSubDel] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	// ** State
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const rowOptionsOpen = Boolean(anchorEl);

	const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleRowOptionsClose = () => {
		setAnchorEl(null);
		setSubDel(false);
	};

	const handleEditCurrencie = async () => {
		dispatch(setCurrentCurrencie(row));
		handleRowOptionsClose();
	};
	const handleDeleteCurrencie = async () => {
		if (subDel) {
			try {
				const res = await dispatch(deleteCurrencie(`${row.id}`));
				if (isAxiosError(res.payload) && res.payload.response?.data.message) {
					if (Array.isArray(res.payload.response.data.message)) {
						res.payload.response.data.message.map((err: string) => toast.error(err));
					} else {
						toast.error(res.payload.response.data.message);
					}
				}
				handleRowOptionsClose();
			} catch (e) {}
		} else {
			await setSubDel(true);
		}
	};

	return (
		<>
			<IconButton
				size='small'
				sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
				onClick={handleRowOptionsClick}
			>
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
				<MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEditCurrencie}>
					<Icon color={'primary.main'} icon='mdi:pencil' fontSize={20} />
					<Translations text='Edit' locale='buttons' />
				</MenuItem>

				{subDel ? (
					<MenuItem sx={{ color: 'error.main', '& svg': { mr: 2 } }} onClick={handleDeleteCurrencie}>
						<Icon icon='mdi:delete' fontSize={20} />
						<Translations text='Submit' locale='buttons' />
					</MenuItem>
				) : (
					<MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDeleteCurrencie}>
						<Icon icon='mdi:delete-outline' fontSize={20} />
						<Translations text='Delete' locale='buttons' />
					</MenuItem>
				)}
			</Menu>
		</>
	);
};
const CurrenciesList = () => {
	const ability = useAbility();
	const { t, i18n } = useTranslation('labels');

	const columns = useMemo(() => {
		const res: GridColDef[] = [
			{
				field: 'displayName',
				headerName: `${t('currency')}`,
				minWidth: 250,
				sortable: false,
				flex: 1,
				renderCell: ({ row }: CellType) => {
					const { displayName, symbol } = row;

					return (
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							{renderClient(row)}
							<Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
								<Typography variant='body1' sx={{ fontWeight: 600 }}>
									{displayName}
								</Typography>
								<Typography noWrap variant='caption'>
									{symbol}
								</Typography>
							</Box>
						</Box>
					);
				}
			}
		];
		if (ability.can('update', 'currencies') || ability.can('delete', 'currencies')) {
			const columnsAction: GridColDef = {
				width: 50,
				sortable: false,
				field: 'actions',
				headerName: 'actions',
				renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
				renderCell: ({ row }: CellType) => <RowOptions row={row} />
			};
			res.push(columnsAction);
		}

		return res;
	}, [i18n.language]);

	// ** State
	const [pagination] = useState<{ pageIndex: number; pageSize: number }>({
		pageSize: 10,
		pageIndex: 0
	});

	const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
	const [isPending, startTransition] = useTransition();

	// ** Hooks
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.currencies);

	const fetchDataTable = () => {
		startTransition(() => {
			dispatch(fetchData());
		});
	};

	useEffect(() => {
		fetchDataTable();
	}, [pagination.pageSize, pagination.pageIndex]);

	useEffect(() => {
		if (store.currentCurrencie) {
			toggleAddUserDrawer();
		}
	}, [store.currentCurrencie]);
	const toggleAddUserDrawer = () => {
		if (addUserOpen) {
			dispatch(setCurrentCurrencie(null));
		}
		setAddUserOpen(prev => !prev);
	};

	return (
		<Grid container spacing={6}>
			{ability.can('create', 'currencies') && (
				<Grid
					item
					xs={12}
					sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', textAlign: 'right' }}
				>
					<Button onClick={toggleAddUserDrawer} variant='outlined'>
						<Translations text='Add' locale='buttons' />
					</Button>
				</Grid>
			)}
			<Grid item xs={12}>
				<Card>
					<CardHeader title={<Translations text='Currencies' locale='navigation' />} />
					<Divider />
					<DataGrid
						paginationMode='server'
						loading={isPending}
						autoHeight
						rows={store.data || []}
						columns={columns}
						pageSize={pagination.pageSize}
						disableSelectionOnClick
						rowsPerPageOptions={[10, 25, 50]}
						hideFooter={true}
					/>
				</Card>
			</Grid>

			{ability.can('create', 'currencies') && <CurrencyDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />}
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

CurrenciesList.acl = {
	action: 'read',
	subject: 'currencies'
};

export default CurrenciesList;

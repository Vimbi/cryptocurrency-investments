import { FC, useEffect, MouseEvent, useState, SyntheticEvent } from 'react';
import { Box, Grid, Card, Typography, MenuItem, IconButton, Menu, Button, CardContent, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

// import Link from 'next/link';

import { getInitials } from 'src/@core/utils/get-initials';
import CustomAvatar from 'src/@core/components/mui/avatar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getRewards } from 'src/store/apps/investment';

// import { styled } from '@mui/material/styles';// ** Icon Imports
import Icon from 'src/@core/components/icon';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { UsersType } from 'src/types/apps/userTypes';
import moment from 'moment';
import 'moment/locale/ru';
import { useTranslation } from 'next-i18next';
import Translations from 'src/layouts/components/Translations';
import { ReferralIncomeType } from 'src/types/apps/investments';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';

moment.locale('ru');

interface CellType {
	row: UsersType;
}
const renderClient = (row: UsersType) => {
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

const TeamTable: FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation('labels');
	const referralIncome = useSelector((state: RootState) => state.investment.referralIncome);

	const columns: GridColDef[] = [
		{
			flex: 0.5,
			minWidth: 230,
			field: 'firstName',
			headerName: `${t('fio')}`,
			sortable: false,
			renderCell: ({ row }: CellType) => {
				return (
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{renderClient(row)}
						<Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
							<Typography variant='body1'>{row.firstName + ' ' + row.surname}</Typography>
						</Box>
					</Box>
				);
			}
		},
		{
			flex: 0.2,
			minWidth: 150,
			field: 'investmentsAmount',
			headerName: `${t('invested')}`,
			sortable: false,
			renderCell: ({ row }: CellType) => {
				return <Typography variant='body1'>{row.investmentsAmount?.toFixed(2)} $</Typography>;
			}
		},
		{
			flex: 0.3,
			minWidth: 150,
			field: 'createdAt',
			headerName: `${t('registerDate')}`,
			sortable: false,
			renderCell: ({ row }: CellType) => {
				return <Typography variant='body2'>{moment(row.createdAt).format('DD.MM.yyy hh:mm')}</Typography>;
			}
		},
		{
			width: 55,
			sortable: false,
			field: 'actions',
			headerName: 'actions',
			headerAlign: 'right',
			renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
			renderCell: ({ row }: { row: UsersType }) => <RowOptions id={`${row.id}`} />
		}
	];
	const refColumns: GridColDef[] = [
		{
			flex: 0.1,
			field: 'amount',
			headerName: `${t('accrued')}`,
			sortable: false,
			renderCell: ({ row }: { row: ReferralIncomeType }) => {
				return <Typography>{row.amount} $</Typography>;
			}
		},
		{
			flex: 0.1,
			field: 'createdAt',
			headerName: `${t('enrollmentAt')}`,
			sortable: false,
			renderCell: ({ row }: { row: ReferralIncomeType }) => {
				return <Typography>{moment(row.createdAt).format('DD.MM.YYYY')}</Typography>;
			}
		}
	];

	const [refPage, setRefPage] = useState(0);
	const [refPageSize, setRefPageSize] = useState(10);
	const [tab, setTab] = useState('1');
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [childId, setChildId] = useState<string | null>(null);
	const [data, setData] = useState<{
		entities: UsersType[];
		limit: number;
		page: number;
		itemCount: number;
	}>({ entities: [], limit: pageSize, page: currentPage, itemCount: 0 });
	const handleGetData = async () => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		const resData = await axios.get(`${authConfig.baseApiUrl}/users/team`, {
			params: {
				page: currentPage + 1,
				limit: pageSize,
				childId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setData(resData.data);
	};

	const changeTab = (event: SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	useEffect(() => {
		handleGetData();
	}, [pageSize, currentPage, childId]);

	useEffect(() => {
		if (tab === '2') {
			dispatch(
				getRewards({
					limit: refPageSize,
					page: refPage + 1
				})
			);
		}
	}, [dispatch, refPageSize, refPage, tab]);

	const RowOptions = ({ id }: { id: number | string }) => {
		// ** Hooks
		// const dispatch = useDispatch<AppDispatch>();

		// ** State
		const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
		const rowOptionsOpen = Boolean(anchorEl);

		const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
			setAnchorEl(event.currentTarget);
		};
		const handleRowOptionsClose = () => {
			setAnchorEl(null);
		};

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
				</Menu>
			</>
		);
	};

	return (
		<TabContext value={tab}>
			<Card>
				<Grid container spacing={0}>
					<CardContent sx={{ width: '100%' }}>
						<Grid
							item
							xs={12}
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between'
							}}
						>
							<TabList
								scrollButtons
								variant='scrollable'
								sx={{ display: !childId ? 'flex' : 'none', overflowX: 'auto' }}
								onChange={changeTab}
							>
								<Tab value='1' label={<Translations text='accrual.me' locale='navigation' />} />
								<Tab value='2' label={<Translations text='accrual.referral' locale='navigation' />} />
							</TabList>
							<Button
								sx={{ display: childId ? 'flex' : 'none' }}
								onClick={() => setChildId('')}
								color='error'
								variant='outlined'
							>
								<Translations text='team.cancel' locale='buttons' />
							</Button>
						</Grid>
					</CardContent>
					<Grid item xs={12}>
						<TabPanel value='1' sx={{ p: 0 }}>
							<DataGrid
								paginationMode='server'
								getRowId={row => row.referralCode}
								rows={data?.entities}
								rowCount={data.itemCount}
								columns={columns}
								autoHeight
								pageSize={pageSize}
								page={currentPage}
								pagination
								onPageChange={page => setCurrentPage(page)}
								onPageSizeChange={size => setPageSize(size)}
								rowsPerPageOptions={[10, 25, 50, 100]}
							/>
						</TabPanel>
						<TabPanel value='2' sx={{ p: 0 }}>
							<DataGrid
								paginationMode='server'
								columns={refColumns}
								rows={referralIncome.data}
								rowCount={referralIncome.itemCount}
								page={refPage}
								pagination={true}
								pageSize={refPageSize}
								autoHeight
								disableSelectionOnClick
								rowsPerPageOptions={[10, 25, 50]}
								onPageChange={e => setRefPage(e)}
								onPageSizeChange={(newPageSize: number) => {
									setRefPageSize(newPageSize);
								}}
							/>
						</TabPanel>
					</Grid>
				</Grid>
			</Card>
		</TabContext>
	);
};

export default TeamTable;

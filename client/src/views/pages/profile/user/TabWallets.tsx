import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Box,
	Button,
	Card,
	CardHeader,
	IconButton,
	Typography,
	Menu,
	MenuItem
} from '@mui/material';
import { useEffect, useState, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { createWallet, deleteWallet, fetchWalletData } from 'src/store/apps/wallets';
import { DataGrid } from '@mui/x-data-grid';
import Icon from 'src/@core/components/icon';
import { WalletType } from 'src/types/apps/userTypes';
import moment from 'moment';
import NewWalletForm from './wallets/NewWalletForm';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';

interface ICell {
	row: WalletType;
}

const RowOptions = ({ row }: { row: WalletType }) => {
	const [open, setOpen] = useState<boolean>(false);

	// ** Hooks
	const dispatch = useDispatch<AppDispatch>();

	// ** State
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const rowOptionsOpen = Boolean(anchorEl);

	const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleRowOptionsClose = () => {
		setAnchorEl(null);
	};
	const handleClose = () => setOpen(false);
	const handleDelete = (id: string) => {
		dispatch(deleteWallet(id));
		handleRowOptionsClose();
		handleClose();
	};

	return (
		<>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>
					<Translations text='DeleteWallet' locale='common' />
				</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						<Translations text='DeleteWalletConfirm' locale='common' />
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button color='error' onClick={handleClose}>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					<Button variant='outlined' color='primary' onClick={() => handleDelete(row.id)}>
						<Translations text='Submit' locale='buttons' />
					</Button>
				</DialogActions>
			</Dialog>
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
				<MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => setOpen(true)}>
					<Icon color={'primary.main'} icon='mdi:trash' fontSize={20} />
					<Translations text='Delete' locale='buttons' />
				</MenuItem>
			</Menu>
		</>
	);
};

const TabWallet = () => {
	const { t } = useTranslation('labels');
	const [open, setOpen] = useState(false);
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const dispatch = useDispatch<AppDispatch>();
	const { wallets } = useSelector((state: RootState) => state);
	useEffect(() => {
		dispatch(fetchWalletData({ page: page + 1, limit }));
	}, [dispatch, page, limit]);

	const handleClose = () => {
		setOpen(false);
	};

	const handleSubmit = async (values: WalletType) => {
		const res = await dispatch(createWallet(values));
		if (isAxiosError(res.payload) && res.payload.response?.data.message) {
			const err = res.payload.response?.data.message;
			if (Array.isArray(err)) {
				err.map(e => toast.error(e));
			} else {
				toast.error(err as string);
			}
		}
		handleClose();
	};

	const columns = [
		{
			flex: 0.1,
			minWidth: 150,
			sortable: false,
			field: 'networkId',
			headerName: `${t('network')}`,
			renderCell: ({ row }: ICell) => {
				return (
					<Box>
						<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
							{row.network?.symbol}
						</Typography>
						<Typography variant='body1'>{row.network?.displayName}</Typography>
					</Box>
				);
			}
		},
		{ flex: 0.5, minWidth: 300, sortable: false, field: 'address', headerName: `${t('walletAddress')}` },
		{ flex: 0.2, minWidth: 200, sortable: false, field: 'note', headerName: `${t('note')}` },
		{
			flex: 0.2,
			minWidth: 150,
			sortable: false,
			field: 'createdAt',
			headerName: `${t('createdAt')}`,
			renderCell: ({ row }: ICell) => {
				return moment(row.createdAt).format('LL');
			}
		},
		{
			width: 50,
			sortable: false,
			field: 'actions',
			headerName: 'actions',
			renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
			renderCell: ({ row }: ICell) => <RowOptions row={row} />
		}
	];

	return (
		<>
			<NewWalletForm open={open} onClose={handleClose} onSubmit={handleSubmit} />
			<Card>
				<CardHeader
					title={<Translations text='wallets' locale='labels' />}
					action={
						<Button onClick={() => setOpen(true)} variant='contained' color='primary'>
							<Translations text='AddWallet' locale='buttons' />
						</Button>
					}
				/>
				<DataGrid
					paginationMode='server'
					autoHeight
					rowCount={wallets.itemCount}
					rows={wallets.data}
					columns={columns}
					pageSize={limit}
					disableSelectionOnClick
					rowsPerPageOptions={[10, 25, 50]}
					onPageChange={e => setPage(e)}
					onPageSizeChange={(newPageSize: number) => {
						setLimit(newPageSize);
					}}
					disableColumnMenu
				/>
			</Card>
		</>
	);
};

export default TabWallet;

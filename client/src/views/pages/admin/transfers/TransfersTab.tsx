import Link from 'next/link';
import {
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	TextField,
	Button
} from '@mui/material';
import Chip from 'src/@core/components/mui/chip';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { useState, useEffect, MouseEvent } from 'react';
import { fetchTransfersAdmin } from 'src/store/apps/transfers';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TransferStatusesType, TransferType, TransferTypesType } from 'src/types/apps/transfersType';

import { styled } from '@mui/material/styles';

import moment from 'moment';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import Icon from 'src/@core/components/icon';
import { toast } from 'react-hot-toast';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

const LinkStyled = styled(Link)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none',
	color: theme.palette.primary.main
}));

const AdminTransfersTab = () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const [open, setOpen] = useState({ state: false, id: '', type: '' });
	const [note, setNote] = useState('');
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [dataTypes, setDataTypes] = useState<TransferTypesType[]>([]);
	const [dataStatuses, setDataStatuses] = useState<TransferStatusesType[]>([]);

	const { t } = useTranslation('labels');
	const {
		settings: { localeId }
	} = useSettings();
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.transfers);

	const StatusHandler = ({ row }: { row: TransferType }) => {
		const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
		const statusObj: any = {
			pending: {
				icon: 'mdi:receipt-text-clock',
				color: 'warning',
				correctSpelling: 'pending',
				label: <Translations text='transferStatuses.pending' locale='labels' />
			},
			completed: {
				icon: 'mdi:star',
				color: 'success',
				correctSpelling: 'complete',
				label: <Translations text='transferStatuses.completed' locale='labels' />
			},
			processed: {
				icon: 'mdi:publish',
				color: 'info',
				correctSpelling: 'publish',
				label: <Translations text='transferStatuses.processed' locale='labels' />
			},
			canceled: {
				icon: 'mdi:cancel',
				color: 'error',
				correctSpelling: 'cancel',
				label: <Translations text='transferStatuses.canceled' locale='labels' />
			}
		};

		if (row.status) {
			const curData = statusObj[`${row.status.name}`];
			const loc = row.status.localeContent[0];

			const handleClick = (event: MouseEvent<HTMLDivElement>) => {
				if (row.status?.name === 'pending' || row.status?.name === 'processed') {
					setAnchorEl(event.currentTarget);
				}
			};
			const handleClose = () => {
				setAnchorEl(null);
			};
			const handleStatusSwitch = async (item: TransferStatusesType, type?: 'deposit' | 'withdrawal') => {
				switch (item.name) {
					case 'processed':
						if (type === 'withdrawal') {
							setOpen({ state: true, id: row.id ?? '', type: 'process-withdrawal' });
						} else {
							try {
								const url = type === 'deposit' ? 'process-deposit' : 'process-withdrawal';
								const resProcessData = await axios.patch(
									`${authConfig.baseApiUrl}/transfers/${url}`,
									{ transferId: row.id },
									{
										headers: {
											Authorization: `Bearer ${storedToken}`
										}
									}
								);
								if (resProcessData.status === 200) {
									handleClose();
									handleGetData();
									toast.success('Трансфер просмотрен');
								}
							} catch (e) {
								if (axios.isAxiosError(e)) {
									if (e.response?.data.message) {
										if (e.response.data.message === 'TxId required') {
											return toast.error('Заявка на пополнение без хэша.\nПопробуйте позже');
										}
									}

									return toast.error('Произошла ошибка.\nПопробуйте позже');
								}
							}
						}
						break;
					case 'canceled':
						setOpen({ state: true, id: row.id ?? '', type: type ?? '' });
						break;
					case 'completed':
						const url = type === 'deposit' ? 'confirm-deposit' : 'confirm-withdrawal';
						try {
							const resConfirmData = await axios.patch(
								`${authConfig.baseApiUrl}/transfers/${url}`,
								{ transferId: row.id },
								{
									headers: {
										Authorization: `Bearer ${storedToken}`
									}
								}
							);
							if (resConfirmData.status === 200) {
								handleClose();
								handleGetData();
								toast.success('Трансфер завершен');
							}
						} catch (e) {
							console.log(e);
							if (axios.isAxiosError(e)) {
								if (e.response?.data.message) {
									if (e.response.data.message === 'TxId required') {
										return toast.error('Заявка на пополнение без хэша.\nПопробуйте позже');
									}
								}

								return toast.error('Произошла ошибка.\nПопробуйте позже');
							}
						}
						break;
				}
				handleClose();
			};

			return (
				<>
					<Chip
						onClick={handleClick}
						icon={<Icon icon={curData.icon} />}
						skin='light'
						size='small'
						label={loc?.displayName ?? curData.label}
						color={curData.color}
						sx={{ textTransform: 'capitalize', pl: 1 }}
					/>
					{dataStatuses.length > 0 ? (
						<Menu keepMounted anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
							{dataStatuses
								.filter(item => item.name !== curData.correctSpelling && item.name !== 'pending')
								.map(item => (
									<MenuItem
										key={item.id}
										onClick={() =>
											handleStatusSwitch(
												item,
												dataTypes.find(data => data.id === row.typeId)?.name
											)
										}
										sx={{
											'& svg': { color: statusObj[`${item.name}`]?.color + '.main', mr: 2 }
										}}
									>
										<Icon icon={statusObj[`${item.name}`].icon} />
										{item.localeContent[0]?.displayName ?? statusObj[`${item.name}`].label}
									</MenuItem>
								))}
						</Menu>
					) : null}
				</>
			);
		}

		return <></>;
	};
	const columns: GridColDef[] = [
		{
			flex: 0.1,
			minWidth: 200,
			field: 'id',
			headerName: '#',
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				return <LinkStyled href={'/apps/transfers/' + row.id}>{row.id}</LinkStyled>;
			}
		},
		{
			flex: 0.1,
			field: 'typeId',
			minWidth: 120,
			headerName: `${t('type')}`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				const loc = row.type?.localeContent[0];
				if (loc) return loc?.displayName;
				else return '-';
			}
		},
		{
			flex: 0.1,
			minWidth: 150,
			field: 'createdAt',
			headerName: `${t('createdAt')}`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				return moment(row.createdAt).format('DD.MM.YYYY');
			}
		},
		{
			flex: 0.1,
			minWidth: 100,
			field: 'currencyId',
			headerName: `${t('currency')}`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				return row.network?.currency?.symbol;
			}
		},
		{
			flex: 0.2,
			minWidth: 150,
			field: 'currencyAmount',
			headerName: `${t('amountByCurrency')}`,
			sortable: false
		},
		{
			flex: 0.2,
			minWidth: 100,
			field: 'amount',
			headerName: `${t('amount')}, $`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				return row.amount ?? 0;
			}
		},
		{
			flex: 0.12,
			minWidth: 150,
			field: 'statusId',
			headerName: `${t('status')}`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => <StatusHandler row={row} />
		}

		// {
		// 	flex: 0.07,
		// 	sortable: false,
		// 	field: 'actions',
		// 	headerName: 'actions',
		// 	renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
		// 	renderCell: ({ row }: CellType) => <RowOptions id={row.id!} />
		// }
	];
	const handleGetAdditionalLists = async () => {
		const resTransferTypes = await axios.get(`${authConfig.baseApiUrl}/transfer-types`, {
			params: { localeId },
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		const resTransferStatuses = await axios.get(`${authConfig.baseApiUrl}/transfer-statuses`, {
			params: { localeId },
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setDataStatuses(resTransferStatuses.data);
		setDataTypes(resTransferTypes.data);
	};
	const handleClose = () => {
		setOpen({ state: false, id: '', type: '' });
		setNote('');
	};
	const handleGetData = () => {
		dispatch(
			fetchTransfersAdmin({
				limit: pageSize,
				page: currentPage + 1,
				localeId
			})
		);
	};
	useEffect(() => {
		handleGetData();
	}, [dispatch, currentPage, pageSize, localeId]);

	useEffect(() => {
		if (localeId) handleGetAdditionalLists();
	}, [localeId]);

	const handleCancel = async () => {
		if (open.type === 'process-withdrawal') {
			try {
				const resProcessData = await axios.patch(
					`${authConfig.baseApiUrl}/transfers/${open.type}`,
					{ transferId: open.id, txId: note },
					{
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					}
				);
				if (resProcessData.status === 200) {
					handleClose();
					handleGetData();
					toast.success('Трансфер обновлен');
				}
			} catch (e) {
				console.log(e);
			}
		} else {
			try {
				const resCancelData = await axios.patch(
					`${authConfig.baseApiUrl}/transfers/cancel-${open.type}`,
					{ transferId: open.id, note },
					{
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					}
				);
				if (resCancelData.status === 200) {
					handleClose();
					handleGetData();
					toast.success('Трансфер отменен');
				}
			} catch (e) {
				console.log(e);
			}
		}
	};

	return (
		<>
			<DataGrid
				paginationMode='server'
				autoHeight
				rowCount={store.itemCount}
				rows={store.data}
				columns={columns}
				pageSize={pageSize}
				disableSelectionOnClick
				rowsPerPageOptions={[10, 25, 50]}
				onPageChange={e => setCurrentPage(e)}
				onPageSizeChange={(newPageSize: number) => {
					setPageSize(newPageSize);
				}}
				disableColumnMenu
			/>
			<Dialog fullWidth maxWidth='md' open={open.state} onClose={handleClose} aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>
					{open.type === 'process-withdrawal' ? 'Хэш' : 'Причина'}
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 3 }}>
						{open.type === 'process-withdrawal'
							? 'Введите хэш операции'
							: 'Введите причину отмены перевода'}
					</DialogContentText>
					<TextField
						value={note}
						onChange={e => setNote(e.target.value)}
						id='note'
						autoFocus
						fullWidth
						label='Причина'
					/>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' onClick={handleClose}>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					<Button onClick={handleCancel} variant='contained'>
						<Translations text='Save' locale='buttons' />
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default AdminTransfersTab;

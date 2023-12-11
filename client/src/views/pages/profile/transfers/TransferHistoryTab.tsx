import {
	TextField,
	CardContent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	DialogContentText
} from '@mui/material';
import Icon from 'src/@core/components/icon';
import Chip from 'src/@core/components/mui/chip';
import { styled } from '@mui/material/styles';

import { forwardRef, useEffect, useState } from 'react';

import DatePicker from 'react-datepicker';

import format from 'date-fns/format';
import { DateType } from 'src/types/forms/reactDatepickerTypes';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { parseErrors } from 'src/@core/utils/parseErrors';
import { TransferType } from 'src/types/apps/transfersType';
import authConfig from 'src/configs/auth';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

const LinkStyled = styled(Link)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none',
	color: theme.palette.primary.main
}));

interface PickerProps {
	start: Date | number;
	end: Date | number;
}

function formatIsoWithoutTimezone(date: Date | null | undefined, isEndOfDay?: boolean) {
	if (!!date) {
		return `${date?.getFullYear()}-${(date?.getMonth() + 1).toString().padStart(2, '0')}-${date
			.getDate()
			.toString()
			.padStart(2, '0')}T${isEndOfDay ? '23:59:59' : '00:00:00'}`;
	} else {
		return null;
	}
}

const TransferTab = () => {
	const {
		settings: { localeId, lang }
	} = useSettings();
	const { t } = useTranslation('labels');
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const columns: GridColDef[] = [
		{
			flex: 0.1,
			minWidth: 200,
			field: 'id',
			headerName: 'ID',
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
				return <LinkStyled href={'/apps/profile/transfers/' + row.id}>{row.id}</LinkStyled>;
			}
		},
		{
			flex: 0.1,
			minWidth: 110,
			field: 'typeId',
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
			minWidth: 120,
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
			flex: 0.1,
			field: 'statusId',
			minWidth: 150,
			headerName: `${t('status')}`,
			sortable: false,
			renderCell: ({ row }: { row: TransferType }) => {
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

					return (
						<Chip
							icon={<Icon icon={curData.icon} />}
							skin='light'
							size='small'
							label={loc?.displayName}
							color={curData.color}
							sx={{ textTransform: 'capitalize', pl: 1 }}
						/>
					);
				}
			}
		}
	];
	const [open, setOpen] = useState(false);
	const [txIdError, setTxIdError] = useState('Не должно быть пробелов');
	const [endDate, setEndDate] = useState<DateType>(null);
	const [startDate, setStartDate] = useState<DateType>(null);
	const [data, setData] = useState<{ entities: TransferType[]; limit: number; page: number; itemCount: number }>();
	const [txId, setTxId] = useState<{ transferId: string; txId: string }>({ transferId: '', txId: '' });
	const [pagination, setPagination] = useState<{ page: number; limit: number }>({ page: 0, limit: 10 });

	const handleOnChange = (dates: [Date | null, Date | null]) => {
		const [start, end] = dates;
		setStartDate(start);
		setEndDate(end);
	};

	const CustomInput = forwardRef((props: PickerProps, ref) => {
		const start = props.start as Date;
		const end = props.end as Date;
		const startDate = !!start ? format(start, 'dd.MM.yyyy') : '';
		const endDate = !!end ? format(end, 'dd.MM.yyyy') : '';

		const value = `${startDate}${!!endDate ? ' - ' + endDate : ''}`;

		return (
			<TextField
				{...props}
				InputProps={{ readOnly: true }}
				label={<Translations text='Period' locale='common' />}
				size='small'
				value={value}
				inputRef={ref}
			/>
		);
	});

	const handleGetData = async () => {
		const start = startDate;
		const end = endDate;

		const startFormat = formatIsoWithoutTimezone(start);
		const endFormat = formatIsoWithoutTimezone(end, true);

		const resData = await axios.get(`${authConfig.baseApiUrl}/transfers`, {
			params: {
				page: pagination.page + 1,
				limit: pagination.limit,
				afterDate: startFormat,
				beforeDate: endFormat,
				localeId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setData(resData.data);
	};

	useEffect(() => {
		handleGetData();
	}, [startDate, endDate, pagination, localeId]);

	const handleClose = () => {
		setOpen(false);
		setTxIdError('');
		setTxId({ transferId: '', txId: '' });
	};
	const handleUpdateTxId = async () => {
		try {
			const resData = await axios.patch(`${authConfig.baseApiUrl}/transfers/update-txid`, txId, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			});
			if (resData.data) {
				handleClose();
				handleGetData();
				toast.success('Запись создана. Ожидайте подтверждение перевода');
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data.message && Array.isArray(error.response?.data.message)) {
					const errors = parseErrors(error.response.data.message);

					errors.forEach(err => {
						if (err.key) {
							setTxIdError(err.message);
						}
					});
				} else {
					if (error.response?.data.message === 'Transfer update forbidden') {
					}
				}
			}
		}
	};

	return (
		<>
			<Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>Hash</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 3 }}>
						<Translations text='history.enterHash' locale='common' />
					</DialogContentText>
					<TextField
						value={txId.txId}
						onChange={value => setTxId(prev => ({ ...prev, txId: `${value.target.value}` }))}
						id='txId'
						autoFocus
						fullWidth
						label='Hash'
						error={!!txIdError}
						helperText={txIdError}
					/>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' onClick={handleClose}>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					<Button onClick={handleUpdateTxId} variant='contained'>
						<Translations text='Save' locale='buttons' />
					</Button>
				</DialogActions>
			</Dialog>
			<CardContent>
				<DatePicker
					isClearable
					selectsRange
					endDate={endDate}
					selected={startDate}
					startDate={startDate}
					onChange={handleOnChange}
					dateFormat={'dd.MM.yyyy'}
					locale={lang}
					customInput={<CustomInput start={startDate as Date | number} end={endDate as Date | number} />}
				/>
			</CardContent>
			<DataGrid
				paginationMode='server'
				columns={columns}
				rows={data?.entities ?? []}
				rowCount={data?.itemCount}
				page={pagination.page}
				pagination={true}
				pageSize={pagination.limit}
				autoHeight
				editMode='cell'
				rowsPerPageOptions={[10, 25, 50]}
				onPageChange={e => setPagination(prev => ({ ...prev, page: e }))}
				onPageSizeChange={(newPageSize: number) => {
					setPagination(prev => ({ ...prev, limit: newPageSize }));
				}}
			/>
		</>
	);
};

export default TransferTab;

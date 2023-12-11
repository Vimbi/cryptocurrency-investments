import { Grid, Typography, TextField, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { forwardRef, useEffect, useState } from 'react';

import DatePicker from 'react-datepicker';

import format from 'date-fns/format';

import { DateType } from 'src/types/forms/reactDatepickerTypes';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TypeTransaction, TypeTransactionType } from 'src/types/apps/transfersType';
import authConfig from 'src/configs/auth';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

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

const TransactionTab = () => {
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
			renderCell: ({ row }: { row: TypeTransaction }) => {
				return <Typography>{row.id}</Typography>;
			}
		},
		{
			flex: 0.1,
			minWidth: 400,
			field: 'typeId',
			headerName: `${t('type')}`,
			sortable: false,
			renderCell: ({ row }: { row: TypeTransaction }) => {
				const type = row.typeDisplayName;
        const userFirstName = row.toUserFirstName || row.fromUserFirstName;
        const userLastName = row.toUserLastName || row.fromUserLastName;

        if (userFirstName) {
          return (
            <div>
              <span>{type}</span>
              <br />
              <span>{userFirstName} {userLastName}</span>
            </div>
          );
        }

				if (type) return type;
				else return '-';
			}
		},

		{
			flex: 0.1,
			minWidth: 120,
			field: 'createdAt',
			headerName: `${t('createdAt')}`,
			sortable: false,
			renderCell: ({ row }: { row: TypeTransaction }) => {
				return moment(row.createdAt).format('DD.MM.YYYY');
			}
		},
		{
			flex: 0.2,
			minWidth: 100,
			field: 'amount',
			headerName: `${t('amount')}, $`,
			sortable: false,
			renderCell: ({ row }: { row: TypeTransaction }) => {
				return row.amount ?? 0;
			}
		}
	];
	const [endDate, setEndDate] = useState<DateType>(null);
	const [startDate, setStartDate] = useState<DateType>(null);
	const [data, setData] = useState<{ entities: TypeTransaction[]; limit: number; page: number; itemCount: number }>();
	const [types, setTypes] = useState<TypeTransactionType[]>();
	const [typeId, setTypeId] = useState<string | null>(null);
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
				fullWidth
				label={<Translations text='Period' locale='common' />}
				{...props}
				InputProps={{ readOnly: true }}
				size='small'
				value={value}
				inputRef={ref}
			/>
		);
	});

	const handleGetTypes = async () => {
		const resData = await axios.get(`${authConfig.baseApiUrl}/transaction-types`, {
			params: {
				localeId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setTypes(resData.data);
	};

	const handleGetData = async () => {
		const start = startDate;
		const end = endDate;

		const startFormat = formatIsoWithoutTimezone(start);
		const endFormat = formatIsoWithoutTimezone(end, true);

		const resData = await axios.get(`${authConfig.baseApiUrl}/transactions`, {
			params: {
				page: pagination.page + 1,
				limit: pagination.limit,
				afterDate: startFormat,
				beforeDate: endFormat,
				localeId,
				typeId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setData(resData.data);
	};

	useEffect(() => {
		handleGetData();
	}, [startDate, endDate, pagination, localeId, typeId]);

	useEffect(() => {
		if (localeId) handleGetTypes();
	}, [localeId]);

	return (
		<>
			<CardContent>
				<Grid container spacing={4}>
					<Grid item xs={12} md='auto'>
						<DatePicker
							isClearable
							selectsRange
							endDate={endDate}
							selected={startDate}
							startDate={startDate}
							onChange={handleOnChange}
							locale={lang}
							dateFormat={'dd.MM.yyyy'}
							customInput={
								<CustomInput start={startDate as Date | number} end={endDate as Date | number} />
							}
						/>
					</Grid>
					<Grid item xs={12} md='auto'>
						<FormControl fullWidth>
							<InputLabel size='small'>
								<Translations text='type' locale='labels' />
							</InputLabel>
							<Select
								fullWidth
								size='small'
								label={<Translations text='type' locale='labels' />}
								onChange={e => setTypeId(e.target.value ? `${e.target.value}` : null)}
							>
								<MenuItem value='' sx={{ fontStyle: 'italic', fontSize: '.75rem' }}>
									<Translations text='all' locale='labels' />
								</MenuItem>
								{types?.map(type => (
									<MenuItem key={type.id} value={type.id}>
										{type.localeContent[0].displayName}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>
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

export default TransactionTab;

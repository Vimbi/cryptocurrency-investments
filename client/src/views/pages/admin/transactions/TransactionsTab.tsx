// import Link from 'next/link';
import {
	MenuItem,
	TextField,
	Grid,
	FormControl,
	InputLabel,
	Select,
	CardContent,
	Autocomplete,
	Typography,
  Link
} from '@mui/material';
import DatePicker from 'react-datepicker';
import { DateType } from 'src/types/forms/reactDatepickerTypes';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { useState, useEffect, forwardRef } from 'react';
import { fetchTransactionsAdmin } from 'src/store/apps/transfers';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { TypeTransaction, TypeTransactionType } from 'src/types/apps/transfersType';

import { styled } from '@mui/material/styles';

import format from 'date-fns/format';
import moment from 'moment';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

interface PickerProps {
	start: Date | number;
	end: Date | number;
}

const LinkStyled = styled(Link)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none',
	color: theme.palette.primary.main
}));

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

const AdminTransactionsTab = () => {
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [typeId, setTypeId] = useState<string | null>(null);

	const [endDate, setEndDate] = useState<DateType>(null);
	const [startDate, setStartDate] = useState<DateType>(null);
	const [dataTypes, setDataTypes] = useState<TypeTransactionType[]>([]);

	const [email, setEmail] = useState<string | null>('');
	const [usersList, setUsersList] = useState([]);
	const [userId, setUserId] = useState<string | null>(null);

	const { t } = useTranslation('labels');
	const {
		settings: { localeId, lang }
	} = useSettings();
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.transfers.transactions);


	const columns: GridColDef[] = [
		{
			flex: 0.1,
			minWidth: 200,
			field: 'id',
			headerName: '#',
			sortable: false,
			renderCell: ({ row }: { row: TypeTransaction }) => {
				return <Typography>{row.id}</Typography>;
			}
		},
		{
			flex: 0.1,
			field: 'typeId',
			minWidth: 400,
			headerName: `${t('type')}`,
			sortable: false,
			renderCell: ({ row }: { row: TypeTransaction }) => {
				const type = row.typeDisplayName;
        const userId = row.toUserId || row.fromUserId;
        const userFirstName = row.toUserFirstName || row.fromUserFirstName;
        const userLastName = row.toUserLastName || row.fromUserLastName;

        if (userId && userFirstName) {
          return (
            <span>
              {type}
              <LinkStyled href={`/apps/user/view/${userId}`}>
                {userFirstName} {userLastName}
              </LinkStyled>
            </span>
          );
        }

				if (type) return type;
				else return '-';
			}
		},
		{
			flex: 0.1,
			minWidth: 150,
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
	const handleGetAdditionalLists = async () => {
		const resData = await axios.get(`${authConfig.baseApiUrl}/transaction-types`, {
			params: {
				localeId
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setDataTypes(resData.data);
	};
	const handleGetData = () => {
		const start = startDate;
		const end = endDate;

		const startFormat = formatIsoWithoutTimezone(start)!;
		const endFormat = formatIsoWithoutTimezone(end, true)!;

		dispatch(
			fetchTransactionsAdmin({
				limit: pageSize,
				page: currentPage + 1,
				afterDate: startFormat,
				beforeDate: endFormat,
				typeId,
				localeId,
				userId
			})
		);
	};

	const handleOnChangeDate = (dates: [Date | null, Date | null]) => {
		const [start, end] = dates;
		setStartDate(start);
		setEndDate(end);
	};

	const searchUsers = async () => {
		const resUsers = await axios.get(`${authConfig.baseApiUrl}/users`, {
			params: {
				email
			},
			headers: {
				Authorization: `Bearer ${storedToken}`
			}
		});
		setUsersList(resUsers.data.entities.map((user: any) => ({ id: user.id, email: user.email })));
	};

	useEffect(() => {
		handleGetData();
	}, [dispatch, currentPage, pageSize, localeId, typeId, startDate, endDate, userId]);

	useEffect(() => {
		if (!!email) searchUsers();
	}, [email]);

	useEffect(() => {
		if (localeId) handleGetAdditionalLists();
	}, [localeId]);

	return (
		<>
			<DatePickerWrapper>
				<CardContent>
					<Grid container spacing={4}>
						<Grid item xs={12} md={4}>
							<DatePicker
								isClearable
								selectsRange
								endDate={endDate}
								selected={startDate}
								startDate={startDate}
								onChange={handleOnChangeDate}
								locale={lang}
								dateFormat={'dd.MM.yyyy'}
								customInput={
									<CustomInput start={startDate as Date | number} end={endDate as Date | number} />
								}
							/>
						</Grid>

						<Grid item xs={12} md={4}>
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
									{dataTypes?.map(type => (
										<MenuItem key={type.id} value={type.id}>
											{type.localeContent[0].displayName}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4}>
							<Autocomplete
								size='small'
								options={usersList}
								onChange={(_, userId) => setUserId(userId?.id ?? null)}
								inputValue={`${email}`}
								getOptionLabel={(option: any) => option.email}
								onInputChange={(_, email) => setEmail(email)}
								renderInput={params => <TextField {...params} label='E-mail' />}
							/>
						</Grid>
					</Grid>
				</CardContent>
			</DatePickerWrapper>
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
		</>
	);
};

export default AdminTransactionsTab;

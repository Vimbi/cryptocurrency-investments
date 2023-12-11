// ** Next and React
import { NextPage } from 'next';
import { useEffect, useState, forwardRef } from 'react';

// ** MUI
import { Grid, Card, CardHeader, CardContent, Typography, Box, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ** Utils
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';

// ** Hooks and types
import { getAccruals, getCurrentInvestment } from 'src/store/apps/investment';
import { DateType } from 'src/types/forms/reactDatepickerTypes';
import { AppDispatch, RootState } from 'src/store';
import format from 'date-fns/format';
import moment from 'moment';
import { AccrualsType } from 'src/types/apps/investments';
import { useRouter } from 'next/router';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

interface PickerProps {
	start: Date | number;
	end: Date | number;
}

const Accruals: NextPage = () => {
	const router = useRouter();
	const {
		settings: { localeId }
	} = useSettings();

	// ** Filter By period
	const [endDate, setEndDate] = useState<DateType>(null);
	const [startDate, setStartDate] = useState<DateType>(null);
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const handleOnChange = (dates: any) => {
		const [start, end] = dates;
		setStartDate(start);
		setEndDate(end);
	};
	const CustomInput = forwardRef((props: PickerProps, ref) => {
		const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : '';
		const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null;

		const value = `${startDate}${endDate !== null ? endDate : ''}`;

		return <TextField {...props} InputProps={{ readOnly: true }} size='small' value={value} inputRef={ref} />;
	});

	const { t } = useTranslation('labels');
	const dispatch = useDispatch<AppDispatch>();
	const invest = useSelector((state: RootState) => state.investment.currentInvestment);
	const accruals = useSelector((state: RootState) => state.investment.accruals);

	useEffect(() => {
		dispatch(getCurrentInvestment());
	}, []);

	useEffect(() => {
		const dispatchParams = {
			limit,
			page: page + 1,
			localeId
		};
		if (startDate && endDate) {
			Object.assign(dispatchParams, {
				afterDate: moment(startDate).format(),
				beforeDate: moment(endDate).format()
			});
		}
		dispatch(getAccruals(dispatchParams));
	}, [dispatch, limit, page, startDate, endDate, localeId]);

	const columns: GridColDef[] = [
		{
			flex: 0.1,
			field: 'createdAt',
			headerName: `${t('createdAt')}`,
			sortable: false,
			renderCell: ({ row }: { row: AccrualsType }) => {
				return <Typography>{moment(row.createdAt).format('DD.MM.YYYY')}</Typography>;
			}
		},
		{
			flex: 0.1,
			field: 'amount',
			headerName: `${t('accrued')}`,
			sortable: false,
			renderCell: ({ row }: { row: AccrualsType }) => {
				return <Typography>{row.amount} $</Typography>;
			}
		},
		{
			flex: 0.1,
			field: 'type',
			headerName: `${t('type')}`,
			sortable: false,
			renderCell: ({ row }: { row: AccrualsType }) => {
				const type = row.type.localeContent[0]?.displayName;

				return <Typography>{type ?? '-'}</Typography>;
			}
		}
	];

	return (
		<DatePickerWrapper>
			<Grid container spacing={6}>
				<Grid item xs={12} md={6}>
					<Card sx={{ height: '100%' }}>
						<CardHeader title={<Translations text='CurrentBalance' locale='investment' />} />
						<CardContent>
							<Typography color='primary' variant='h1'>
								$ {(!!invest ? invest.balance : 0).toFixed(2)}
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mt: 10 }}>
								<Button
									sx={{
										mb: { xs: 4, sm: 0 },
										mr: { xs: 0, sm: 4 }
									}}
									variant='contained'
									onClick={() => router.push('/apps/profile/investment#invest')}
								>
									<Translations text='Invest' locale='buttons' />
								</Button>
								<Button
									variant='outlined'
									onClick={() => router.push('/apps/profile/create-withdrawal/')}
								>
									<Translations text='Withdrawal' locale='buttons' />
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card sx={{ height: '100%' }}>
						<CardHeader title={<Translations text='TotalInvest' locale='investment' />} />
						<CardContent>
							<Typography color='primary' variant='h1'>
								$ {(!!invest && invest.totalIncome ? invest.totalIncome : 0).toFixed(2)}
							</Typography>
							<Grid container xs={12} spacing={4} sx={{ mt: 10 }}>
								<Grid item xs={6}>
									<Typography variant='body2'>
										<Translations text='finesCount' locale='investment' />
									</Typography>
									<Typography variant='h6'>{!!invest ? invest.finesNumber : 0}</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography variant='body2'>
										<Translations text='finesAmount' locale='investment' />
									</Typography>
									<Typography variant='h6'>{!!invest ? invest.finesAmount : 0}</Typography>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
			<Card sx={{ mt: 6 }}>
				<CardHeader
					title={
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'fit-content(100%) fit-content(100%)' },
								alignItems: 'center',
								gridGap: 24
							}}
						>
							<Typography variant='body1'>
								<Translations text='Period' locale='common' />
							</Typography>
							<Box>
								<DatePicker
									isClearable
									selectsRange
									endDate={endDate}
									selected={startDate}
									startDate={startDate}
									onChange={handleOnChange}
									locale='ru'
									customInput={
										<CustomInput
											start={startDate as Date | number}
											end={endDate as Date | number}
										/>
									}
								/>
							</Box>
						</Box>
					}
				/>
				<DataGrid
					paginationMode='server'
					columns={columns}
					rows={accruals.data}
					rowCount={accruals.itemCount}
					page={page}
					pagination={true}
					pageSize={limit}
					autoHeight
					disableSelectionOnClick
					rowsPerPageOptions={[10, 25, 50]}
					onPageChange={e => setPage(e)}
					onPageSizeChange={(newPageSize: number) => {
						setLimit(newPageSize);
					}}
				/>
			</Card>
		</DatePickerWrapper>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'common', 'buttons', 'footer', 'investment', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

Accruals.acl = {
	subject: 'accruals',
	action: 'read'
};

export default Accruals;

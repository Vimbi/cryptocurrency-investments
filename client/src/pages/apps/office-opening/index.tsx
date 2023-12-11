import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import authConfig from 'src/configs/auth';
import { Typography, Tooltip, Card } from '@mui/material';
import moment from 'moment';
import 'moment/locale/ru';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

moment.locale('ru');

type OfficeType = {
	createdAt: string;
	email: string;
	id: string;
	name: string;
	note: null | string;
	notifiedAt: string;
	phone: string;
	surname: string;
};

const OfficeOpeningrequests: NextPage = () => {
	const { t } = useTranslation('labels');

	const columns = [
		{
			flex: 0.2,
			minWidth: 150,
			sortable: false,
			field: 'name',
			headerName: `${t('name')}`,
			renderCell: ({ row }: { row: OfficeType }) => {
				return <Typography variant='body1' sx={{ fontWeight: 500 }}>{`${row.name} ${row.surname}`}</Typography>;
			}
		},
		{
			flex: 0.2,
			minWidth: 160,
			sortable: false,
			field: 'phone',
			headerName: `${t('phone')}`
		},
		{
			flex: 0.2,
			minWidth: 200,
			sortable: false,
			field: 'email',
			headerName: 'E-mail'
		},
		{
			flex: 0.2,
			minWidth: 200,
			sortable: false,
			field: 'note',
			headerName: `${t('note')}`,
			renderCell: ({ row }: { row: OfficeType }) => (
				<Tooltip title={row.note} sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
					<Typography sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{row.note}</Typography>
				</Tooltip>
			)
		},
		{
			flex: 0.2,
			minWidth: 200,
			sortable: false,
			field: 'createdAt',
			headerName: `${t('createdAt')}`,
			renderCell: ({ row }: { row: OfficeType }) => moment(row.createdAt).format('DD.MM.YYYY H:mm:ss')
		}
	];

	const [data, setData] = useState<{ entities: OfficeType[]; limit: number; page: number; itemCount: number }>({
		entities: [],
		limit: 0,
		page: 0,
		itemCount: 0
	});
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const handleGetData = async () => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
		try {
			const resData = await axios.get(`${authConfig.baseApiUrl}/office-opening-requests`, {
				params: { page: page + 1, limit },
				headers: { Authorization: 'Bearer ' + storedToken }
			});
			setData(resData.data);
		} catch (e) {}
	};

	useEffect(() => {
		handleGetData();
	}, [page, limit]);

	return (
		<Card>
			<DataGrid
				paginationMode='server'
				autoHeight
				rowCount={data.itemCount}
				rows={data.entities}
				columns={columns}
				pageSize={limit}
				disableSelectionOnClick
				rowsPerPageOptions={[10, 25, 50]}
				onPageChange={e => setPage(e)}
				onPageSizeChange={(newPageSize: number) => {
					setLimit(newPageSize);
				}}
			/>
		</Card>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

export default OfficeOpeningrequests;

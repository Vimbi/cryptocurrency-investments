// ** Next & React imports
import { NextPage } from 'next';
import { useState, useEffect } from 'react';

// ** MUI imports
import { Box, Button, Card, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import Icon from 'src/@core/components/icon';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from 'src/store';
import { deleteRaffle, fetchData } from 'src/store/apps/raffles';

// ** Types & Utils
import { RaffleType } from 'src/types/apps/raffleTypes';
import moment from 'moment';
import RaffleForm from './RaffleForm';
import toast from 'react-hot-toast';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

moment.locale('ru');
interface CellType {
	row: RaffleType;
}

const RowOptions = ({ row }: CellType) => {
	const {
		settings: { localeId }
	} = useSettings();
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const handleDelete = async () => {
		if (isDeleting) {
			const res = await dispatch(deleteRaffle({ id: `${row.id}`, localeId }));
			if (res.payload.status === 200) {
				setIsDeleting(false);
				toast.success('Розыгрыш удален');
			}
		} else {
			setIsDeleting(true);
		}
	};
	const handleEdit = () => {
		if (!isDeleting) {
			setOpen(true);
		} else {
			setIsDeleting(false);
		}
	};
	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Box
			sx={{
				width: '100%',
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				justifyContent: 'end',
				alignItems: 'center',
				gridGap: 8
			}}
		>
			<RaffleForm open={open} onClose={handleClose} existingRaffle={row} />
			<Button
				variant={isDeleting ? 'contained' : 'outlined'}
				onClick={handleEdit}
				color='primary'
				sx={{ minWidth: 0, px: 2 }}
			>
				<Icon width={20} height={20} icon={isDeleting ? 'mdi:close' : 'mdi:pencil'} />
			</Button>
			<Button
				onClick={handleDelete}
				color='error'
				variant={isDeleting ? 'contained' : 'outlined'}
				sx={{ minWidth: 0, px: 2 }}
			>
				<Icon width={20} height={20} icon={isDeleting ? 'mdi:check' : 'mdi:trash'} />
			</Button>
		</Box>
	);
};

const Raffles: NextPage = () => {
	const [open, setOpen] = useState(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);

	const { t } = useTranslation('labels');
	const {
		settings: { localeId }
	} = useSettings();
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.raffles);

	useEffect(() => {
		if (localeId)
			dispatch(
				fetchData({
					limit: pageSize,
					page: currentPage + 1,
					localeId
				})
			);
	}, [dispatch, currentPage, pageSize, localeId]);

	const handleClose = () => {
		setOpen(false);
	};

	const columns: GridColDef[] = [
		{
			flex: 0.2,
			minWidth: 150,
			sortable: false,
			field: 'title',
			headerName: `${t('title')}`,
			renderCell: ({ row }: CellType) => {
				const isLocolized = (row.localeContent as RaffleType[]).length > 0;
				const locTitle = isLocolized ? (row.localeContent as RaffleType[])[0].title : 'No language reference';

				return (
					<Tooltip sx={{ maxWidth: '700px' }} placement='top' title={locTitle}>
						<Typography
							variant={isLocolized ? 'subtitle1' : 'subtitle2'}
							sx={{
								fontWeight: !isLocolized ? 400 : 700,
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								fontStyle: !isLocolized ? 'italic' : ''
							}}
						>
							{locTitle}
						</Typography>
					</Tooltip>
				);
			}
		},

		{
			flex: 0.3,
			minWidth: 200,
			sortable: false,
			field: 'description',
			headerName: `${t('description')}`,
			renderCell: ({ row }: CellType) => {
				const isLocolized = (row.localeContent as RaffleType[]).length > 0;
				const locDesc = isLocolized
					? (row.localeContent as RaffleType[])[0].description
					: 'No language reference';

				return (
					<Tooltip title={locDesc}>
						<Typography
							variant={isLocolized ? 'body1' : 'body2'}
							sx={{
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								fontStyle: !isLocolized ? 'italic' : ''
							}}
						>
							{locDesc}
						</Typography>
					</Tooltip>
				);
			}
		},
		{
			flex: 0.2,
			minWidth: 160,
			sortable: false,
			field: 'startDate',
			headerName: `${t('date')}`,
			renderCell: ({ row }: CellType) => (
				<Box>
					<Typography
						variant='body1'
						sx={{ color: 'primary.main', textOverflow: 'ellipsis', overflow: 'hidden' }}
					>
						{moment(row.startDate).format('DD.MM.YYYY HH:mm')}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: 'error.light', textOverflow: 'ellipsis', overflow: 'hidden' }}
					>
						{moment(row.endDate).format('DD.MM.YYYY HH:mm')}
					</Typography>
				</Box>
			)
		},
		{
			flex: 0.1,
			minWidth: 150,
			sortable: false,
			field: 'isPubslihed',
			headerName: `${t('articles.isPublished')}`,
			renderCell: ({ row }: CellType) => (
				<Typography>
					{row.isPublished ? (
						<Translations text='yes' locale='labels' />
					) : (
						<Translations text='no' locale='labels' />
					)}
				</Typography>
			)
		},
		{
			width: 120,
			sortable: false,
			field: 'actions',
			headerName: 'actions',
			headerAlign: 'right',
			renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
			renderCell: ({ row }: CellType) => <RowOptions row={row} />
		}
	];

	return (
		<>
			<RaffleForm open={open} onClose={handleClose} />
			<Card>
				<CardHeader
					title={<Translations text='Raffles' locale='navigation' />}
					action={
						<Box>
							<Tooltip placement='top' title={<Translations text='Add' locale='buttons' />}>
								<IconButton onClick={() => setOpen(true)} color='primary'>
									<Icon icon='mdi:plus' />
								</IconButton>
							</Tooltip>
						</Box>
					}
				/>
				<DataGrid
					paginationMode='server'
					columns={columns}
					rows={store.data}
					rowCount={store.itemCount}
					page={currentPage}
					pageSize={pageSize}
					disableSelectionOnClick
					autoHeight
					rowsPerPageOptions={[10, 25, 50]}
					onPageChange={e => setCurrentPage(e)}
					onPageSizeChange={(newPageSize: number) => {
						setPageSize(newPageSize);
					}}
				/>
			</Card>
		</>
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

export default Raffles;

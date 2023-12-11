// ** Next & React imports
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// ** MUI imports
import { Box, Button, Card, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import Icon from 'src/@core/components/icon';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from 'src/store';
import { deleteArtcle, fetchData } from 'src/store/apps/articles';
import { fetchData as fetchTypes } from 'src/store/apps/articleTypes';

// ** Utils imports
import { ArticleType } from 'src/types/apps/articleTypes';
import { toast } from 'react-hot-toast';
import ArticleForm from './articleForm';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import { useSettings } from 'src/@core/hooks/useSettings';

interface CellType {
	row: ArticleType;
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
			const res = await dispatch(deleteArtcle({ id: `${row.id}`, localeId }));
			if (res.payload.status === 200) {
				setIsDeleting(false);
				toast.success('Статья удалена');
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
			<ArticleForm open={open} onClose={handleClose} existingArticle={row} />
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

const Articles: NextPage = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);

	const { t } = useTranslation('labels');
	const {
		settings: { localeId }
	} = useSettings();

	const columns: GridColDef[] = [
		{
			flex: 0.2,
			minWidth: 200,
			sortable: false,
			field: 'title',
			headerName: `${t('title')}`,
			renderCell: ({ row }: CellType) => {
				const isLocolized = (row.localeContent as ArticleType[]).length > 0;
				const locTitle = isLocolized ? (row.localeContent as ArticleType[])[0].title : 'No language reference';

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
			sortable: false,
			minWidth: 200,
			field: 'text',
			headerName: `${t('articles.text')}`,
			renderCell: ({ row }: CellType) => {
				const isLocolized = (row.localeContent as ArticleType[]).length > 0;
				const locText = isLocolized ? (row.localeContent as ArticleType[])[0].text : 'No language reference';

				return (
					<Tooltip title={locText}>
						<Typography
							variant={isLocolized ? 'body1' : 'body2'}
							sx={{
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								fontStyle: !isLocolized ? 'italic' : ''
							}}
						>
							{locText}
						</Typography>
					</Tooltip>
				);
			}
		},
		{
			flex: 0.1,
			sortable: false,
			minWidth: 120,
			field: 'typeId',
			headerName: `${t('type')}`,
			renderCell: ({ row }: CellType) => <Typography>{row.type?.name}</Typography>
		},
		{
			flex: 0.1,
			minWidth: 100,
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

	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.articles);

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

	useEffect(() => {
		if (localeId) dispatch(fetchTypes(localeId));
	}, [localeId, dispatch]);

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<ArticleForm open={open} onClose={handleClose} />
			<Card>
				<CardHeader
					title={<Translations text='Articles' locale='navigation' />}
					action={
						<Box
							sx={{
								display: 'flex',
								alignItems: { xs: 'flex-end', sm: 'center' },
								gap: 2
							}}
						>
							<Tooltip
								placement='top'
								title={<Translations text='ArticleTable.handleTypes' locale='buttons' />}
							>
								<IconButton onClick={() => router.push('/apps/articles/types')} color='info'>
									<Icon icon='mdi:format-list-checks' />
								</IconButton>
							</Tooltip>

							<Tooltip
								placement='top'
								title={<Translations text='ArticleTable.addArticle' locale='buttons' />}
							>
								<IconButton onClick={() => setOpen(true)} color='primary'>
									<Icon icon='mdi:plus' />
								</IconButton>
							</Tooltip>
						</Box>
					}
				/>
				<DataGrid
					paginationMode='server'
					autoHeight
					rowCount={store.itemCount}
					rows={store.data}
					columns={columns}
					page={currentPage}
					pageSize={pageSize}
					disableSelectionOnClick
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

export default Articles;

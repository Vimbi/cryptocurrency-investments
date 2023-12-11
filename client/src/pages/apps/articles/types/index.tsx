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
import { fetchData, deleteArtcleType } from 'src/store/apps/articleTypes';
import { ArticleTypeType, LocaleType } from 'src/types/apps/articleTypes';
import { toast } from 'react-hot-toast';
import ArticleTypeForm from './articleTypeForm';
import * as cookie from 'cookie';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import authConfig from 'src/configs/auth';
import axios from 'axios';
import { useSettings } from 'src/@core/hooks/useSettings';

interface CellType {
	row: ArticleTypeType;
	locales?: LocaleType[];
}

const RowOptions = ({ row, locales }: CellType) => {
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const handleDelete = async () => {
		if (isDeleting) {
			const res = await dispatch(deleteArtcleType(`${row.id}`));
			if (res.payload.status === 200) {
				setIsDeleting(false);
				toast.success(<Translations text='success' locale='labels' />);
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
			<ArticleTypeForm open={open} onClose={handleClose} existingArticle={row} locales={locales} />
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

const ArticleTypes: NextPage = () => {
	const [open, setOpen] = useState(false);
	const [locales, setLocales] = useState<LocaleType[]>();
	const router = useRouter();
	const { t } = useTranslation('labels');
	const {
		settings: { localeId }
	} = useSettings();

	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.articleTypes.data);

	useEffect(() => {
		if (localeId) {
			dispatch(fetchData(''));
		}
	}, [dispatch]);
	const handleClose = () => {
		setOpen(false);
	};

	const columns: GridColDef[] = [
		{
			flex: 0.2,
			minWidth: 200,
			sortable: false,
			field: 'name',
			headerName: `${t('type')}`,
			renderCell: ({ row }: CellType) => (
				<Typography variant='subtitle1' sx={{ fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden' }}>
					{row.name}
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
			renderCell: ({ row }: CellType) => <RowOptions row={row} locales={locales} />
		}
	];

	const fetchLocales = async () => {
		const res = await axios.get(`${authConfig.baseApiUrl}/locales`);
		if (res.status === 200) {
			setLocales(res.data);
		}
	};

	useEffect(() => {
		fetchLocales();
	}, []);

	return (
		<>
			<ArticleTypeForm open={open} onClose={handleClose} locales={locales} />
			<Card>
				<CardHeader
					title={<Translations text='ArticleTable.types' locale='buttons' />}
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
								title={<Translations text='ArticleTable.backToArticle' locale='buttons' />}
							>
								<IconButton onClick={() => router.push('/apps/articles/')} color='info'>
									<Icon icon='mdi:chevron-left' />
								</IconButton>
							</Tooltip>

							<Tooltip
								placement='top'
								title={<Translations text='ArticleTable.addType' locale='buttons' />}
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
					columns={columns}
					autoHeight
					disableColumnFilter={true}
					disableColumnMenu={true}
					disableColumnSelector={true}
					hideFooter={true}
					rows={store}
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

export default ArticleTypes;

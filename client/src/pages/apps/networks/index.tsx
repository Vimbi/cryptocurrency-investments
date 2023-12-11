// ** React Imports
import { useState, useEffect, useTransition, useMemo } from 'react';

// ** Next Imports
import Link from 'next/link';

// ** MUI Imports
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux';

// ** Utils Import
import * as yup from 'yup';
import * as cookie from 'cookie';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Actions Imports
import { fetchData, addNetwork, editNetwork, deleteNetwork, setCurrentNetwork } from 'src/store/apps/network';
import { fetchData as fetchCurrenciesList } from 'src/store/apps/currencies';

// import toast from 'react-hot-toast';
// ** Third Party Components
import { useForm, Controller } from 'react-hook-form';

// ** Types Imports
import { RootState, AppDispatch } from 'src/store';
import { NetworkType } from 'src/types/apps/networkType';
import { CurrencieType } from 'src/types/apps/currenciesType';

// ** For get TokenVariable

import { Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, Select, Tooltip } from '@mui/material';

import { toast } from 'react-hot-toast';

import { useAbility } from 'src/hooks/useAbility';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';

const LinkStyled = styled(Link)(({ theme }) => ({
	fontWeight: 600,
	fontSize: '1rem',
	cursor: 'pointer',
	textDecoration: 'none',
	color: theme.palette.text.secondary,
	'&:hover': {
		color: theme.palette.primary.main
	}
}));

interface CellType {
	row: NetworkType;
}

const schema = yup.object().shape({
	currencyId: yup.string().required('Обязательное поле'),
	displayName: yup.string().required('Обязательное поле'),
	description: yup.string().required('Обязательное поле'),
	depositAddress: yup.string().required('Обязательное поле')
});
const defaultValues = {
	currencyId: '',
	displayName: '',
	description: '',
	depositAddress: ''
};
const NetworkList = () => {
	const ability = useAbility();
	const { t } = useTranslation('labels');

	const RowOptions = ({ row }: CellType) => {
		const dispatch = useDispatch<AppDispatch>();

		// ** Hooks
		// const dispatch = useDispatch<AppDispatch>();

		// ** State
		// const userRole = auth.user?.role;
		// const auth = useAuth();
		// const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
		// const rowOptionsOpen = Boolean(anchorEl);

		// const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
		// 	setAnchorEl(event.currentTarget);
		// };
		// const handleRowOptionsClose = () => {
		// 	setAnchorEl(null);
		// 	setSubDel(false);
		// };

		const handleEditNetwork = async () => {
			setOpen(true);
			dispatch(setCurrentNetwork(row));
			networkForm.reset(row);
		};

		// const handleDeleteCurrencie = async () => {
		// 	if (subDel) {
		// 		try {
		// 			// await dispatch(deleteCurrencie(`${row.id}`));
		// 			// handleRowOptionsClose();
		// 		} catch (e) {}
		// 	} else {
		// 		await setSubDel(true);
		// 	}
		// };

		return (
			<>
				<IconButton
					size='small'
					sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
					onClick={handleEditNetwork}
				>
					<Icon icon='mdi:pencil' />
				</IconButton>
			</>
		);
	};
	const networkForm = useForm({ defaultValues, mode: 'onChange', resolver: yupResolver(schema) });
	const [pagination] = useState<{ pageIndex: number; pageSize: number }>({
		pageSize: 10,
		pageIndex: 0
	});
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	// ** Hooks
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.networks);
	const currencies = useSelector((state: RootState) => state.currencies);

	const columns = useMemo(() => {
		const res: GridColDef[] = [
			{
				field: 'displayName',
				headerName: `${t('displayName')}`,
				sortable: false,
				flex: 0.2,
				minWidth: 150,
				renderCell: ({ row }: CellType) => {
					const { displayName } = row;

					return <LinkStyled href={``}>{displayName}</LinkStyled>;
				}
			},
			{
				field: 'description',
				headerName: `${t('description')}`,
				minWidth: 200,
				sortable: false,
				flex: 0.3
			},
			{
				field: 'currencyId',
				headerName: `${t('currency')}`,
				minWidth: 100,
				sortable: false,
				flex: 0.1,
				renderCell: ({ row }: CellType) => {
					const currency = currencies.data
						? currencies.data.filter((c: CurrencieType) => c.id === row.currencyId)[0]
						: null;

					return (
						<Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
							{currency ? (
								<Tooltip
									sx={{
										fontWeight: 600,
										color: 'text.secondary',
										'&:hover': { color: 'primary.main' }
									}}
									title={currency.displayName}
									placement='right'
								>
									<Typography>{currency.symbol}</Typography>
								</Tooltip>
							) : (
								<Typography color='error'>-- fetch error --</Typography>
							)}
						</Box>
					);
				}
			},
			{
				field: 'depositAddress',
				headerName: `${t('depositAddress')}`,
				sortable: false,
				flex: 0.3,
				minWidth: 200
			}
		];
		if (ability.can('update', 'networks') || ability.can('delete', 'networks')) {
			const columnAction: GridColDef = {
				flex: 0.07,
				sortable: false,
				field: 'actions',
				headerName: 'actions',
				renderHeader: () => <Icon icon='mdi:cog' fontSize={20} />,
				renderCell: ({ row }: CellType) => <RowOptions row={row} />
			};
			res.push(columnAction);
		}

		return res;
	}, [ability, currencies]);

	const fetchAdditionalData = () => {
		dispatch(fetchCurrenciesList());
	};
	const fetchDataTable = () => {
		startTransition(() => {
			dispatch(
				fetchData({
					limit: pagination.pageSize,
					page: pagination.pageIndex + 1
				})
			);
		});
	};

	const handleOpenModal = () => {
		setOpen(true);
		dispatch(setCurrentNetwork(null));
		networkForm.reset({});
	};

	const handleCloseModal = () => {
		setOpen(false);
	};
	const handleDeleteNetwork = async () => {
		if (store.currentNetwork?.id) {
			dispatch(deleteNetwork(store.currentNetwork?.id));
			handleCloseModal();
		}
	};
	const onSubmit = async (data: NetworkType) => {
		if (store.currentNetwork) {
			const diffData: NetworkType = {};
			Object.keys(data).map((key: string) => {
				if (data[key] !== store.currentNetwork![key]) {
					diffData[key] = data[key];
				}
			});
			if (Object.keys(diffData).length > 0) {
				const resData = await dispatch(editNetwork({ id: store.currentNetwork.id!, data: diffData }));
				if (resData.payload === 200) {
					handleCloseModal();
				} else if (resData.payload.data.message) {
					if (Array.isArray(resData.payload.data.message)) {
						resData.payload.data.message.map((err: string) => toast.error(err));
					} else {
						toast.error(resData.payload.data.message);
					}
					handleCloseModal();
				} else {
					handleCloseModal();
					toast.error('Ошибка при проверке данных. Сеть с таким названием или валютой уже существует');
				}
			} else {
				handleCloseModal();
			}
		} else {
			const resData = await dispatch(addNetwork(data));
			handleCloseModal();
			networkForm.reset();
			if (resData.payload.id && resData.meta.requestStatus === 'fulfilled') {
				toast.success(<Translations text='success' locale='labels' />);
			} else if (resData.payload.data.statusCode === 400) {
				if (Array.isArray(resData.payload.data.message)) {
					resData.payload.data.message.map((err: string) => toast.error(err));
				} else {
					toast.error(resData.payload.data.message);
				}
			} else {
				if (resData.payload.data.message) {
					if (Array.isArray(resData.payload.data.message)) {
						resData.payload.data.message.map((err: string) => toast.error(err));
					} else {
						toast.error(resData.payload.data.message);
					}
				} else {
					toast.error('Ошибка при проверке данных. Сеть с таким названием или валютой уже существует');
				}
			}
		}
	};

	useEffect(() => {
		fetchDataTable();
	}, [pagination.pageSize, pagination.pageIndex]);
	useEffect(() => {
		fetchAdditionalData();
	}, []);

	return (
		<Grid container spacing={6}>
			<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', textAlign: 'right' }}>
				{ability.can('create', 'networks') && (
					<Button onClick={handleOpenModal} variant='outlined'>
						<Translations text='Add' locale='buttons' />
					</Button>
				)}
			</Grid>
			<Grid item xs={12}>
				<Card>
					<CardHeader title={<Translations text='Networks' locale='navigation' />} />
					<Divider />
					<DataGrid
						paginationMode='server'
						loading={isPending}
						autoHeight
						rowCount={store.data.length}
						rows={store.data}
						columns={columns}
						pageSize={pagination.pageSize}
						disableSelectionOnClick
						hideFooter={true}
						rowsPerPageOptions={[10, 25, 50]}
					/>
				</Card>
			</Grid>
			{(ability.can('update', 'networks') ||
				ability.can('delete', 'networks') ||
				ability.can('create', 'networks')) && (
				<Dialog
					maxWidth='md'
					fullWidth
					open={open}
					onClose={handleCloseModal}
					aria-labelledby='form-dialog-title'
				>
					<DialogTitle id='form-dialog-title'>
						{store.currentNetwork ? (
							store.currentNetwork.displayName
						) : (
							<>
								<Translations text='Add' locale='buttons' />{' '}
								<Translations text='network' locale='labels' />
							</>
						)}
					</DialogTitle>
					<DialogContent>
						<form onSubmit={networkForm.handleSubmit(onSubmit)}>
							<Box sx={{ display: 'flex', p: '10px 20px 0', flexDirection: 'column', gap: '.25rem' }}>
								<FormControl fullWidth sx={{ mb: 6 }}>
									<Controller
										name='displayName'
										control={networkForm.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												value={value}
												label={<Translations text='displayName' locale='labels' />}
												onChange={onChange}
												error={Boolean(networkForm.formState.errors.displayName)}
											/>
										)}
									/>
									{networkForm.formState.errors.displayName && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{networkForm.formState.errors.displayName.message}
										</FormHelperText>
									)}
								</FormControl>
								<FormControl fullWidth sx={{ mb: 6 }}>
									<Controller
										name='description'
										control={networkForm.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												multiline
												rows={3}
												value={value}
												label={<Translations text='description' locale='labels' />}
												onChange={onChange}
												error={Boolean(networkForm.formState.errors.description)}
											/>
										)}
									/>
									{networkForm.formState.errors.description && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{networkForm.formState.errors.description.message}
										</FormHelperText>
									)}
								</FormControl>
								<FormControl fullWidth sx={{ mb: 6 }}>
									<Controller
										name='currencyId'
										control={networkForm.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<>
												<InputLabel
													id='controlled-select-label'
													error={Boolean(networkForm.formState.errors.currencyId)}
												>
													<Translations text='currency' locale='labels' />
												</InputLabel>
												<Select
													label={<Translations text='currency' locale='labels' />}
													value={value}
													onChange={onChange}
													error={Boolean(networkForm.formState.errors.currencyId)}
													labelId='controlled-select-label'
													disabled={!!store.currentNetwork}
												>
													{currencies.data?.map((c: CurrencieType) => (
														<MenuItem key={c.id} value={c.id}>
															{c.displayName}
														</MenuItem>
													))}
												</Select>
											</>
										)}
									/>
									{networkForm.formState.errors.description && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{networkForm.formState.errors.description.message}
										</FormHelperText>
									)}
								</FormControl>
								<FormControl fullWidth sx={{ mb: 6 }}>
									<Controller
										name='depositAddress'
										control={networkForm.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												value={value}
												label={<Translations text='depositAddress' locale='labels' />}
												onChange={onChange}
												error={Boolean(networkForm.formState.errors.depositAddress)}
											/>
										)}
									/>
									{networkForm.formState.errors.depositAddress && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{networkForm.formState.errors.depositAddress.message}
										</FormHelperText>
									)}
								</FormControl>
							</Box>

							<DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Box>
									{store.currentNetwork && ability.can('delete', 'networks') && (
										<Button onClick={handleDeleteNetwork} color='error' variant='contained'>
											<Translations text='Delete' locale='buttons' />
										</Button>
									)}
								</Box>
								<Box
									sx={{
										display: 'grid',
										gridGap: '1rem',
										gridTemplateColumns: 'repeat(2,fit-content(100%))'
									}}
								>
									<Button
										variant='outlined'
										color={store.currentNetwork ? 'primary' : 'error'}
										onClick={handleCloseModal}
									>
										<Translations text='Cancel' locale='buttons' />
									</Button>
									{store.currentNetwork
										? ability.can('update', 'networks') && (
												<Button type='submit' variant='contained'>
													<Translations text='Save' locale='buttons' />
												</Button>
										  )
										: ability.can('create', 'networks') && (
												<Button type='submit' variant='contained'>
													<Translations text='Add' locale='buttons' />
												</Button>
										  )}
								</Box>
							</DialogActions>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'investment', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

NetworkList.acl = {
	action: 'read',
	subject: 'networks'
};

export default NetworkList;

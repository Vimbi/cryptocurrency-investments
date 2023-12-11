// ** MUI Imports
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba';

// ** Custom Components Imports
// import CustomChip from 'src/@core/components/mui/chip';

// ** Types
import { ProductTarifType } from 'src/types/apps/tarifTypes';

import Image from 'next/image';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

import { Investment } from 'src/types/apps/investments';
import { useAuth } from 'src/hooks/useAuth';
import { FC, useState } from 'react';
import CreateInvestModal from 'src/views/pages/profile/invsetment/CreateInvestModal';
import { useRouter } from 'next/router';
import {
	Autocomplete,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
  Switch,
	TextField,
	Tooltip
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { AppDispatch } from 'src/store';
import { useDispatch } from 'react-redux';
import { editTarif } from 'src/store/apps/tarif';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { isAxiosError } from 'axios';
import Translations from 'src/layouts/components/Translations';
import { useTranslation } from 'next-i18next';
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown';
import { useSettings } from 'src/@core/hooks/useSettings';

// ** Styled Component for the wrapper of whole component
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
	position: 'relative',
	padding: theme.spacing(6),
	paddingTop: theme.spacing(14.75),
	borderRadius: theme.shape.borderRadius
}));

interface Props {
	data: ProductTarifType;
	invest?: Partial<Investment>;
}

const PlanDetails: FC<Props> = ({ data, invest }) => {
	const { settings, saveSettings } = useSettings();
	const { t } = useTranslation('labels');
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const [showForm, setShowForm] = useState(false);
	const [productId, setProductId] = useState('');
	const [openEdit, setOpenEdit] = useState(false);
	const auth = useAuth().user;

	const formEdit = useForm({
		defaultValues: {
			displayName: '',
			price: 0,
			features: [''],
      isProlongsInvestment: false
		}
	});

	const handleInvest = () => {
		setProductId(data.id ?? '');
		setShowForm(true);
	};

	const handleOpenEdit = () => {
		setOpenEdit(true);
		formEdit.reset({ ...data, features: data.localeContent.length > 0 ? data.localeContent[0].features : [] });
	};

	const handleCloseEdit = () => {
		setOpenEdit(false);
	};

	const handleEdit = async (values: Partial<ProductTarifType>) => {
    console.log(values);

		const { id, price, displayName, earnings, features, isProlongsInvestment } = values;
		const editData = {
			productId: id,
			localeId: settings.localeId,
			price,
			earnings,
      isProlongsInvestment,
			localeContent: { features, localeId: settings.localeId }
		};
		if (displayName !== data.displayName) {
			Object.assign(editData, { displayName });
		}
		const res = await dispatch(editTarif(editData));
		if (res.payload.status === 200) {
			toast.success('Тариф изменен');
			handleCloseEdit();
		} else if (isAxiosError(res.payload) && res.payload.response?.data.message) {
			handleCloseEdit();
			const errMess = res.payload.response.data.message;
			if (Array.isArray(errMess)) {
				errMess.map(err => toast.error(err));
			} else {
				toast.error(errMess);
			}
		}
	};

	const content = data.localeContent;

	return (
		<>
			<CreateInvestModal
				isNewInvestment={(invest?.invested as number) === 0}
				open={showForm}
				handleClose={setShowForm}
				productId={productId}
			/>
			<BoxWrapper
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					height: '100%',
					paddingTop: '1.5rem',
					px: { xs: 3, sm: '1.5rem' },
					backgroundColor: theme =>
						data?.displayName !== 'Vip'
							? data?.displayName === 'Gold'
								? `${hexToRGBA(theme.palette.warning.main, 0.4)}`
								: `${hexToRGBA(theme.palette.info.main, 0.1)}`
							: `${hexToRGBA(theme.palette.primary.main, 0.25)}`,
					border: theme =>
						data?.displayName !== 'Vip'
							? `1px solid ${theme.palette.divider}`
							: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.5)}`
				}}
			>
				<Box
					sx={{
						height: '5.5rem',
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						position: 'relative',
						borderRadius: 1,
						overflow: 'hidden'
					}}
				>
					<Image
						style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
						src={`${data?.imgSrc}`}
						width={500}
						height={24}
						quality={80}
						alt={`${data?.displayName ?? ''.toLowerCase().replace(' ', '-')}-plan-img`}
					/>
					<Typography
						sx={{
							px: '0.5rem',
							position: 'absolute',
							left: '0.75rem',
							top: '0.75rem',
							backgroundColor: 'rgba(255, 255, 255, 0.9)',
							color: '#16642F',
							borderRadius: 0.5
						}}
					>
						{data?.displayName}
					</Typography>
				</Box>
				<Box sx={{ textAlign: 'center' }}>
					<Box sx={{ my: 7, position: 'relative' }}>
						{data?.price && (
							<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 1 }}>
								<Typography variant='caption' sx={{ mt: 1.6, fontWeight: 600, pb: 2 }}>
									<Translations text='until' locale='labels' />
								</Typography>
								<Typography
									variant='h6'
									sx={{ mt: 1.6, fontWeight: 600, color: 'primary.main', pb: 1 }}
								>
									$
								</Typography>
								<Typography
									variant='h2'
									sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.17 }}
								>
									{data.price}
								</Typography>
							</Box>
						)}
						{/* {data?.price && (
							<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
								<Typography variant='caption' sx={{ mt: 1.6, fontWeight: 600, alignSelf: 'center' }}>
									Процент начисления
								</Typography>
								<Typography
									variant='h4'
									sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.25 }}
								>
									{data.earnings}
								</Typography>
								<Typography
									variant='caption'
									sx={{ mb: 1.6, fontWeight: 600, color: 'primary.main', alignSelf: 'flex-end' }}
								>
									% в день
								</Typography>
							</Box>
						)} */}
						<List>
							{content[0]?.features &&
								content[0].features?.length > 0 &&
								content[0].features.map((item: any, index: any) => (
									<ListItem key={index} sx={{ p: 0 }}>
										<ListItemIcon>
											<Icon
												width={10}
												height={10}
												color='rgba(200, 200, 200, .75)'
												icon='mdi:circle'
											/>
										</ListItemIcon>
										<ListItemText color='rgba(110, 181, 133, .5)' sx={{ m: 0 }}>
											<Typography
												component={'div'}
												variant='caption'
												sx={{
													whiteSpace: 'pre-wrap',
													'& strong': { color: 'primary.main' }
												}}
											>
												<ReactMarkdown>{item}</ReactMarkdown>
											</Typography>
										</ListItemText>
									</ListItem>
								))}
						</List>
					</Box>
				</Box>
				{router.pathname === '/apps/tariffs' ? (
					<Button fullWidth variant='contained' onClick={handleOpenEdit}>
						<Translations text='Edit' locale='buttons' />
					</Button>
				) : !!auth && !!invest?.invested && invest?.invested > 0 ? (
					<Button
						disabled={invest?.productId === data.id || (invest?.invested as number) > (data.price ?? 0)}
						onClick={handleInvest}
						fullWidth
						variant={
							invest?.productId === data.id || (invest?.invested as number) <= (data.price ?? 0)
								? 'contained'
								: 'outlined'
						}
					>
						{invest.productId === data.id ? (
							<Translations text='TariffCurrent' locale='buttons' />
						) : (invest?.invested as number) > (data.price ?? 0) ? (
							<Translations text='TariffNotActive' locale='buttons' />
						) : (
							<Translations text='tariffImprove' locale='buttons' />
						)}
					</Button>
				) : !!auth && !!invest && invest.invested === 0 && router.pathname === '/apps/profile/investment' ? (
					<Button fullWidth variant='contained' onClick={handleInvest}>
						<Translations text='SelectRate' locale='buttons' />
					</Button>
				) : (
					<Button
						onClick={() => {
							router.push('/apps/profile/investment');
						}}
						fullWidth
						variant='contained'
					>
						<Translations text='SelectRate' locale='buttons' />
					</Button>
				)}
			</BoxWrapper>
			<Dialog maxWidth='md' fullWidth open={openEdit} onClose={handleCloseEdit}>
				<DialogTitle>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						{data.displayName}
						<LanguageDropdown settings={settings} saveSettings={saveSettings} />
					</Box>
				</DialogTitle>
				<form onSubmit={formEdit.handleSubmit(handleEdit)}>
					<DialogContent>
						<Grid container spacing={5}>
							<Grid item xs={12}>
								<FormControl fullWidth>
									<Controller
										name='displayName'
										control={formEdit.control}
										rules={{ required: true }}
										render={({ field }) => (
											<TextField
												error={Boolean(formEdit.formState.errors.displayName)}
												label={`${t('tariffName')}`}
												placeholder='Vip'
												{...field}
											/>
										)}
									/>
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<FormControl fullWidth>
									<Controller
										name='price'
										control={formEdit.control}
										rules={{ required: true }}
										render={({ field }) => (
											<TextField
												error={Boolean(formEdit.formState.errors.price)}
												label={`${t('price')}`}
												placeholder='0'
												type='number'
												{...field}
											/>
										)}
									/>
								</FormControl>
							</Grid>
							{/* <Grid item xs={12}>
								<FormControl fullWidth>
									<Controller
										name='earnings'
										control={formEdit.control}
										rules={{ required: true }}
										render={({ field }) => (
											<TextField
												error={Boolean(formEdit.formState.errors.earnings)}
												label={`${t('earningPerDay')}`}
												placeholder='0-100'
												{...field}
											/>
										)}
									/>
								</FormControl>
							</Grid> */}
							<Grid item xs={12}>
								<FormControl fullWidth>
									<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
										<Controller
											name='features'
											control={formEdit.control}
											rules={{ required: true }}
											render={({ field }) => (
												<Autocomplete
                        sx={{ width: 'calc(100% - 24px)' }}
													multiple
													options={[]}
													freeSolo
													value={field.value}
													onChange={(event, newValue) =>
														formEdit.setValue('features', newValue)
													}
													renderInput={params => (
														<TextField {...params} label={`${t('features')}`} />
													)}
												/>
											)}
										/>
										<Tooltip
											sx={{ '& *': { whiteSpace: 'pre-wrap' } }}
											title={<Translations text='TariffHelper' locale='common' />}
										>
											<Box>
												<Icon icon='mdi:help' />
											</Box>
										</Tooltip>
									</Box>
								</FormControl>
							</Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name='isProlongsInvestment'
                    control={formEdit.control}
                    render={({ field }) => (
                      <Box>
                        <Switch checked={field.value} {...field} />
            						<Translations text='TariffProlongation' locale='common' />
                      </Box>
                    )}
                  />
                </FormControl>
              </Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						<Button variant='outlined' onClick={handleCloseEdit}>
							<Translations text='Cancel' locale='buttons' />
						</Button>
						<Button variant='contained' type='submit'>
							<Translations text='Save' locale='buttons' />
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
};

export default PlanDetails;

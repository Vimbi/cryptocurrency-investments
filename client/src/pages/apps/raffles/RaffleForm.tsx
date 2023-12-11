import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import {
	TextField,
	FormHelperText,
	Grid,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
	Button,
	FormControl,
	Switch,
	FormControlLabel,
	List,
	ListItem,
	Typography,
	IconButton,
	Box
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import Icon from 'src/@core/components/icon';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import { LoadingButton } from '@mui/lab';
import { RaffleFileType, RaffleType } from 'src/types/apps/raffleTypes';
import { createRaffle, editRaffle } from 'src/store/apps/raffles';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DatePicker, { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import moment from 'moment';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown';

registerLocale('ru', ru);
moment.locale('ru');

interface IProps {
	existingRaffle?: RaffleType;
	open: boolean;
	onClose: () => void;
}

interface FileProp {
	name: string;
	type: string;
	size: number;
	path?: string;
	id?: string;
}

const schema = yup.object().shape({
	title: yup.string().required(),
	description: yup.string().required(),
	startDate: yup.string().required(),
	endDate: yup.string().required()
});

function isPromise(p: any) {
	if (typeof p === 'object' && typeof p.then === 'function') {
		return true;
	}

	return false;
}

type GetObjDifferentKeys<T, U> = Omit<T, keyof U> & Omit<U, keyof T>;
type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>;
type DeepMergeTwoTypes<T, U> = Partial<GetObjDifferentKeys<T, U>> & { [K in keyof GetObjSameKeys<T, U>]: T[K] | U[K] };

const MAX_FILES = 20;
const MAX_SIZE = 15728640;

const RaffleForm: FC<IProps> = ({ existingRaffle, open, onClose }) => {
	const { settings, saveSettings } = useSettings();
	const [isLoading, setIsLoading] = useState(false);
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const [filesLight, setFilesLight] = useState<File[]>([]);
	const [filesDark, setFilesDark] = useState<File[]>([]);
	const [manualError, setManualError] = useState('');
	const form = useForm<RaffleType>({
		defaultValues: { title: '', description: '', endDate: null, startDate: null, isPublished: false },
		mode: 'onChange',
		resolver: yupResolver(schema)
	});
	const dispatch = useDispatch<AppDispatch>();

	const handleClose = () => {
		onClose();
		setIsLoading(false);
	};

	useEffect(() => {
		if (!!existingRaffle && open) {
			const { isPublished, id, startDate, endDate, localeContent, files } = existingRaffle;
			const formattedData = {
				isPublished,
				id,
				title: localeContent.length > 0 ? localeContent[0].title : '',
				description: localeContent.length > 0 ? localeContent[0].description : '',
				startDate: moment(startDate).toDate(),
				endDate: moment(endDate).toDate()
			};
			form.reset(formattedData);
			if (files) {
				setFilesLight(files.filter(item => item.theme === 'light').map(file => Object.assign(file.file)));
				setFilesDark(files.filter(item => item.theme === 'dark').map(file => Object.assign(file.file)));
			}
		}
	}, [open, settings.localeId, existingRaffle]);

	const onDropFiles = (files: File[], theme: string) => {
		if (filesLight.length < MAX_FILES && files.length + filesLight.length <= MAX_FILES) {
			const images = files.filter(file => file.type.startsWith('image'));
			switch (theme) {
				case 'light':
					setFilesLight(prev => [...prev, ...images.map((file: File) => Object.assign(file))]);
					break;
				case 'dark':
					setFilesDark(prev => [...prev, ...images.map((file: File) => Object.assign(file))]);
					break;
			}
		} else setManualError('Количество файлов превышает максимально заданное значение');
	};

	const lightDropzone = useDropzone({
		maxFiles: MAX_FILES,
		maxSize: MAX_SIZE,
		accept: {
			'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
			'text/*': ['.pdf']
		},

		onDrop: (acceptedFiles: File[]) => {
			if (filesLight.length < MAX_FILES && acceptedFiles.length + filesLight.length <= MAX_FILES)
				onDropFiles(acceptedFiles, 'light');
			else setManualError('Количество файлов превышает максимально заданное значение');
		},
		onDropRejected: () => {
			setManualError('Вы может загрузить до 20 файлов (картинки или pdf-документы) размером не больше 15 Мб.');
		}
	});
	const darkDropzone = useDropzone({
		maxFiles: MAX_FILES,
		maxSize: MAX_SIZE,
		accept: {
			'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
			'text/*': ['.pdf']
		},

		onDrop: (acceptedFiles: File[]) => {
			if (filesDark.length < MAX_FILES && acceptedFiles.length + filesDark.length <= MAX_FILES)
				onDropFiles(acceptedFiles, 'dark');
			else setManualError('Количество файлов превышает максимально заданное значение');
		},
		onDropRejected: () => {
			setManualError('Вы может загрузить до 20 файлов (картинки или pdf-документы) размером не больше 15 Мб.');
		}
	});
	const renderFilePreview = (file: DeepMergeTwoTypes<FileProp, RaffleFileType>) => {
		if ((!!file.type && file.type.startsWith('image')) || (!!file.extension && !file.extension.includes('pdf'))) {
			if (file.path && !!file.extension) {
				return (
					<Box
						sx={{
							position: 'relative',
							minHeight: '64px',
							minWidth: '64px',
							overflow: 'hidden',
							borderRadius: 1
						}}
					>
						<Image style={{ objectFit: 'cover' }} fill alt={file.name} src={file.path} />
					</Box>
				);
			} else {
				return (
					<Box
						sx={{
							position: 'relative',
							minHeight: '64px',
							minWidth: '64px',
							overflow: 'hidden',
							borderRadius: 1
						}}
					>
						<Image
							style={{ objectFit: 'cover' }}
							fill
							alt={file.name}
							src={URL.createObjectURL(file as any)}
						/>
					</Box>
				);
			}
		} else {
			return <Icon icon='mdi:file-document-outline' />;
		}
	};
	const handleRemoveFile = (file: DeepMergeTwoTypes<RaffleFileType, File>) => {
		const filteredLight = filesLight.filter((i: FileProp) => i.id !== file.id || i.name !== file.name);
		const filteredDark = filesDark.filter((i: FileProp) => i.id !== file.id || i.name !== file.name);

		setFilesLight(filteredLight);
		setFilesDark(filteredDark);
	};
	const FileList = ({ files, theme }: { files: any; theme?: string }) => {
		return files.map((file: FileProp) => (
			<ListItem key={file.name} sx={{ width: 'fit-content' }}>
				<Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
					{renderFilePreview(file)}
					<Box>
						<IconButton onClick={() => handleRemoveFile(file)}>
							<Icon icon='mdi:close' fontSize={20} />
						</IconButton>
						{!!theme && (
							<Box
								sx={{
									position: 'absolute',
									color: 'primary.main',
									left: 60,
									top: -10
								}}
							>
								<Icon
									icon={theme === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'}
									fontSize={20}
								/>
							</Box>
						)}

						<Typography variant='body2'>
							{file.size &&
								(Math.round(file.size / 100) / 10 > 1000
									? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
									: `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`)}
						</Typography>
					</Box>
				</Box>
			</ListItem>
		));
	};

	const handleRemoveAllFiles = () => {
		setFilesDark([]);
		setFilesLight([]);
	};

	const onSubmit = async (values: RaffleType) => {
		setIsLoading(true);
		if (!!existingRaffle) {
			const existingFiles = existingRaffle.files;
			const newFilesLight = filesLight.filter((f: any) => !f.id);
			const newFilesDark = filesDark.filter((f: any) => !f.id);

			const noChange: { fileId: string; theme: string | null }[] = [];
			const delFiles: RaffleFileType[] = [];
			existingFiles?.forEach(existingFile => {
				const foundInLight = filesLight.find((f: any) => f.id === existingFile.file.id);
				const foundInDark = filesDark.find((f: any) => f.id === existingFile.file.id);
				if (!!foundInLight || !!foundInDark) {
					noChange.push({ fileId: existingFile.file.id, theme: existingFile.theme ?? null });
				} else {
					delFiles.push(existingFile.file);
				}
			});
			const newLightPromise = newFilesLight.map(async f => {
				const fD = new FormData();
				fD.append('file', f);
				if (f.type && !f.type.includes('pdf'))
					return axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					});
			});
			const newDarkPromise = newFilesDark.map(async f => {
				const fD = new FormData();
				fD.append('file', f);
				if (f.type && !f.type.includes('pdf'))
					return axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					});
			});
			const resLightPromise = await Promise.allSettled(newLightPromise);
			const resDarkPromise = await Promise.allSettled(newDarkPromise);
			if (!isPromise(resLightPromise) && !isPromise(resDarkPromise)) {
				const loadedLightFiles = resLightPromise.filter(p => p.status === 'fulfilled');
				const loadedDarkFiles = resDarkPromise.filter(p => p.status === 'fulfilled');

				const errorLightFiles = resLightPromise.filter(p => p.status === 'rejected');
				const errorDarkFiles = resDarkPromise.filter(p => p.status === 'rejected');

				const idsLight = loadedLightFiles.map((f: any) => f.value.data.id);
				const idsDark = loadedDarkFiles.map((f: any) => f.value.data.id);
				const ids = [
					...idsDark.map(id => ({ fileId: id, theme: 'dark' })),
					...idsLight.map(id => ({ fileId: id, theme: 'light' })),
					...noChange
				];

				const formattedData = {
					raffleId: values.id,
					startDate: `${moment(values.startDate).format()}`,
					endDate: `${moment(values.endDate).format()}`,
					isPublished: values.isPublished,
					localeContent: {
						description: values.description,
						title: values.title,
						files: ids,
						localeId: settings.localeId
					},
					localeId: settings.localeId
				};
				const res = await dispatch(editRaffle(formattedData));
				if (res.payload.status === 200) {
					const errorFiles = [...errorLightFiles, ...errorDarkFiles];
					const delFilesPromise = delFiles.map(async f => {
						return axios.delete(`${authConfig.baseApiUrl}/files/${f.id}`, {
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						});
					});
					await Promise.all(delFilesPromise);
					handleClose();

					setIsLoading(false);
					if (errorFiles.length > 0) {
						toast.success('Данные розыгрыша изменены, но при загрузке новых файлов, произошла ошибка');
						errorFiles.forEach(() => toast.error('При добавлении нового файла произошла ошибка'));
					} else {
						toast.success('Данные розыгрыша изменены');
					}
				} else if (isAxiosError(res.payload)) {
					if (res.payload.response?.data.message) {
						const err = res.payload.response?.data.message;
						if (Array.isArray(err)) {
							err.map(e => toast.error(e));
						} else toast.error(err);
						handleClose();
					}
				}
			}
		} else {
			try {
				const resLightFilesPromises = filesLight.map(async file => {
					const fD = new FormData();
					fD.append('file', file as File);
					if (file.type && !file.type.includes('pdf'))
						return axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						});
				});
				const resDarkFilesPromises = filesDark.map(async file => {
					const fD = new FormData();
					fD.append('file', file as File);
					if (file.type && !file.type.includes('pdf'))
						return axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						});
				});
				const resLightFilesResponses = await Promise.allSettled(resLightFilesPromises);
				const resDarkFilesResponses = await Promise.allSettled(resDarkFilesPromises);
				if (!isPromise(resLightFilesResponses) && !isPromise(resDarkFilesResponses)) {
					const loadedLightFiles = resLightFilesResponses.filter(p => p.status === 'fulfilled');
					const loadedDarkFiles = resDarkFilesResponses.filter(p => p.status === 'fulfilled');

					const errorLightFiles = resLightFilesResponses.filter(p => p.status === 'rejected');
					const errorDarkFiles = resDarkFilesResponses.filter(p => p.status === 'rejected');

					const idsLight = loadedLightFiles.map((f: any) => f.value.data.id);
					const idsDark = loadedDarkFiles.map((f: any) => f.value.data.id);

					const formattedData = {
						isPublished: values.isPublished,
						startDate: `${moment(values.startDate).format()}`,
						endDate: `${moment(values.endDate).format()}`,
						localeContent: {
							title: values.title,
							description: values.description,
							localeId: settings.localeId,
							files: [
								...idsDark.map(id => ({ fileId: id, theme: 'dark' })),
								...idsLight.map(id => ({ fileId: id, theme: 'light' }))
							]
						},
						localeId: settings.localeId
					};

					const res = await dispatch(createRaffle(formattedData));
					if (res.payload.status === 201) {
						const errorFiles = [...errorLightFiles, ...errorDarkFiles];
						handleClose();
						setIsLoading(false);
						form.reset();
						setFilesLight([]);
						setFilesDark([]);
						if (errorFiles.length > 0) {
							toast.success('Запись розыгрыша создана, но при загрузке новых файлов, произошла ошибка');
							errorFiles.forEach(() => toast.error('При добавлении нового файла произошла ошибка'));
						} else {
							toast.success('Новый розыгрыш создан');
						}
					} else if (isAxiosError(res.payload)) {
						if (res.payload.response?.data.message) {
							const err = res.payload.response?.data.message;
							if (Array.isArray(err)) {
								err.map(e => toast.error(e));
							} else toast.error(err);
							handleClose();
						}
					}
				}
			} catch (e) {}
		}
	};

	useEffect(() => {
		setManualError('');
	}, [filesDark.length, filesLight.length]);

	return (
		<Dialog maxWidth='md' fullWidth onClose={handleClose} open={open}>
			<DialogTitle>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Translations text='articles.i' locale='labels' />
					<LanguageDropdown settings={settings} saveSettings={saveSettings} />
				</Box>
			</DialogTitle>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<DialogContent>
					<Grid container spacing={5}>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='title'
									control={form.control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											error={Boolean(form.formState.errors.title)}
											label={<Translations text='title' locale='labels' />}
											{...field}
										/>
									)}
								/>
								{form.formState.errors.title && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.title.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='description'
									control={form.control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											multiline
											rows={5}
											error={Boolean(form.formState.errors.description)}
											label={<Translations text='description' locale='labels' />}
											{...field}
										/>
									)}
								/>
								{form.formState.errors.description && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.description.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<DatePickerWrapper>
									<Controller
										name='startDate'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<DatePicker
												selected={value as Date}
												showYearDropdown
												showMonthDropdown
												showTimeSelect
												timeIntervals={10}
												timeFormat='HH:mm'
												dateFormat='dd.MM.yyyy HH:mm'
												onChange={e => onChange(e)}
												placeholderText='дд.мм.гггг чч:мм'
												locale='ru'
												customInput={
													<TextField
														fullWidth
														label='Дата начала'
														InputProps={{ readOnly: true }}
														value={value}
														error={Boolean(form.formState.errors.startDate)}
													/>
												}
											/>
										)}
									/>
								</DatePickerWrapper>

								{form.formState.errors.startDate && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.startDate.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<DatePickerWrapper>
									<Controller
										name='endDate'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<DatePicker
												selected={value as Date}
												showYearDropdown
												showMonthDropdown
												showTimeSelect
												timeIntervals={10}
												timeFormat='HH:mm'
												dateFormat='dd.MM.yyyy HH:mm'
												onChange={e => onChange(e)}
												placeholderText='дд.мм.гггг чч:мм'
												locale='ru'
												customInput={
													<TextField
														fullWidth
														label='Дата окончания'
														InputProps={{ readOnly: true }}
														value={value}
														onChange={onChange}
														error={Boolean(form.formState.errors.endDate)}
													/>
												}
											/>
										)}
									/>
								</DatePickerWrapper>

								{form.formState.errors.endDate && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.endDate.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl>
								<Controller
									name='isPublished'
									control={form.control}
									rules={{ required: false }}
									render={({ field }) => (
										<FormControlLabel
											label={<Translations text='articles.isPublished' locale='labels' />}
											control={<Switch checked={!!field.value} {...field} />}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='h6' sx={{ textAlign: 'center' }}>
								Светлая тема
							</Typography>
							<Box
								{...lightDropzone.getRootProps({ className: 'dropzone' })}
								sx={{ py: 4, border: '1px dashed', borderColor: 'secondary.main', borderRadius: 1 }}
							>
								<input {...lightDropzone.getInputProps()} />
								<Box
									sx={{
										display: 'flex',
										flexDirection: ['column', 'column', 'row'],
										alignItems: 'center'
									}}
								>
									<Box
										sx={{
											width: '100%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center'
										}}
									>
										<Typography sx={{ px: 2 }} variant='h5' textAlign='center'>
											Перенесите изображения и документы или нажмите в эту область для загрузки
											файлов
										</Typography>
										<Typography sx={{ mt: 4 }} color='textSecondary'>
											Форматы *.pdf, *.jpeg, *.jpg, *.png, *.gif
										</Typography>
										<Typography sx={{ mt: 4 }} color='textSecondary'>
											Максимальный размер картинок - 5 Мб
										</Typography>
										<Typography color='textSecondary'>Максимальный размер pdf - 15 Мб </Typography>
									</Box>
								</Box>
							</Box>
						</Grid>
						<Grid item xs={12} md={6}>
							<Typography variant='h6' sx={{ textAlign: 'center' }}>
								Темная тема
							</Typography>
							<Box
								{...darkDropzone.getRootProps({ className: 'dropzone' })}
								sx={{ py: 4, border: '1px dashed', borderColor: 'secondary.main', borderRadius: 1 }}
							>
								<input {...darkDropzone.getInputProps()} />
								<Box
									sx={{
										display: 'flex',
										flexDirection: ['column', 'column', 'row'],
										alignItems: 'center'
									}}
								>
									<Box
										sx={{
											width: '100%',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center'
										}}
									>
										<Typography sx={{ px: 2 }} variant='h5' textAlign='center'>
											Перенесите изображения и документы или нажмите в эту область для загрузки
											файлов
										</Typography>
										<Typography sx={{ mt: 4 }} color='textSecondary'>
											Форматы *.pdf, *.jpeg, *.jpg, *.png, *.gif
										</Typography>
										<Typography sx={{ mt: 4 }} color='textSecondary'>
											Максимальный размер картинок - 5 Мб
										</Typography>
										<Typography color='textSecondary'>Максимальный размер pdf - 15 Мб</Typography>
									</Box>
								</Box>
							</Box>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant='body2' sx={{ my: 2 }} color='error'>
								{manualError}
							</Typography>
							{filesLight.length ? (
								<>
									<List
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr' }
										}}
									>
										<FileList files={filesLight} theme='light' />
									</List>
								</>
							) : null}
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography variant='body2' sx={{ my: 2 }} color='error'>
								{manualError}
							</Typography>
							{filesDark.length ? (
								<>
									<List
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr' }
										}}
									>
										<FileList files={filesDark} theme='dark' />
									</List>
								</>
							) : null}
						</Grid>
						<Grid item xs={12}>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Typography sx={{ mx: 2 }}>
									{filesLight.length + filesDark.length} / {MAX_FILES}
								</Typography>
								<Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
									<Translations text='Delete' locale='buttons' />{' '}
									<Translations text='all' locale='labels' />
								</Button>
							</Box>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' onClick={handleClose}>
						<Translations text='Cancel' locale='buttons' />
					</Button>
					{isLoading ? (
						<LoadingButton loading variant='outlined'>
							load
						</LoadingButton>
					) : (
						<Button variant='contained' type='submit'>
							<Translations text='Save' locale='buttons' />
						</Button>
					)}
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default RaffleForm;

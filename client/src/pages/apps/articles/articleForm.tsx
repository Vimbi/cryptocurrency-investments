import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
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
	Select,
	MenuItem,
	InputLabel,
	List,
	ListItem,
	Typography,
	IconButton,
	Box,
	Tooltip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ArticleFileType, ArticleType, ArticleTypeType } from 'src/types/apps/articleTypes';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createArticle, editArticle } from 'src/store/apps/articles';
import { toast } from 'react-hot-toast';
import Icon from 'src/@core/components/icon';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import { LoadingButton } from '@mui/lab';
import Translations from 'src/layouts/components/Translations';
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown';
import { useSettings } from 'src/@core/hooks/useSettings';

interface IProps {
	existingArticle?: ArticleType;
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
	text: yup.string().required(),
	typeId: yup.string().required(),
	videoLink: yup
		.string()
		.nullable()
		.matches(
			/^\s*$|(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/(?:watch\?v=|embed\/|v\/|[^#&?]*[?&]v=))([^&#]{11})/i,
			'Invalid link'
		)
});

type GetObjDifferentKeys<T, U> = Omit<T, keyof U> & Omit<U, keyof T>;
type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>;
type DeepMergeTwoTypes<T, U> = Partial<GetObjDifferentKeys<T, U>> & { [K in keyof GetObjSameKeys<T, U>]: T[K] | U[K] };

function isPromise(p: any) {
	if (typeof p === 'object' && typeof p.then === 'function') {
		return true;
	}

	return false;
}

function checkAxiosError(error: any) {
	if (isAxiosError(error)) {
		return error.response?.data.message;
	}
}

const MAX_FILES = 20;
const MAX_SIZE = 15728640;

const ArticleForm: FC<IProps> = ({ existingArticle, open, onClose }) => {
	const { settings, saveSettings } = useSettings();
	const [isLoading, setIsLoading] = useState(false);
	const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
	const [filesPdf, setFilesPdf] = useState<File[]>([]);
	const [filesLight, setFilesLight] = useState<File[]>([]);
	const [filesDark, setFilesDark] = useState<File[]>([]);
	const [manualError, setManualError] = useState<string | string[]>('');
	const [loadedFiles, setLoadedFiles] = useState<{ theme?: string | null; fileId: string }[]>([]);
	const filesToDelete = useRef<string[]>([]);

	const form = useForm<ArticleType>({
		defaultValues: { title: '', text: '', isPublished: false },
		mode: 'onChange',
		resolver: yupResolver(schema)
	});
	const dispatch = useDispatch<AppDispatch>();
	const { data } = useSelector((state: RootState) => state.articleTypes);

	const handleClose = () => {
		onClose();
		setIsLoading(false);
	};

	useEffect(() => {
		if (!!existingArticle && open) {
			const { isPublished, id, typeId, localeContent, articleFiles } = existingArticle;
			form.reset({
				isPublished,
				id,
				typeId,
				title: localeContent.length > 0 ? localeContent[0].title : '',
				text: localeContent.length > 0 ? localeContent[0].text : '',
				videoLink: localeContent.length > 0 ? localeContent[0].videoLink : ''
			});
			const files = articleFiles?.filter(file => !filesToDelete.current.includes(file.fileId));
			if (files) {
				setLoadedFiles(
					files.map(file => ({
						fileId: file.fileId,
						theme: file.theme
					}))
				);
				setFilesLight(files.filter(item => item.theme === 'light').map(file => Object.assign(file.file)));
				setFilesDark(files.filter(item => item.theme === 'dark').map(file => Object.assign(file.file)));
				setFilesPdf(files.filter(item => !item.theme).map(file => Object.assign(file.file)));
			}
		}
	}, [open, settings.localeId, existingArticle, filesToDelete.current.length]);

	const onDropFiles = async (files: File[], theme: string) => {
		if (filesLight.length < MAX_FILES && files.length + filesLight.length <= MAX_FILES) {
			const pdfFiles = files.filter(file => !file.type.startsWith('image'));
			const images = files.filter(file => file.type.startsWith('image'));

			setIsLoading(true);
			if (pdfFiles.length > 0) {
				const resDocsPromises = pdfFiles.map(async file => {
					const fD = new FormData();
					fD.append('file', file as File);
					try {
						const res = await axios.post(`${authConfig.baseApiUrl}/files/upload-doc`, fD, {
							headers: {
								Authorization: `Bearer ${storedToken}`
							}
						});

						return res;
					} catch (e) {
						const err = checkAxiosError(e);
						throw err;
					}
				});
				const resDocsResponses = await Promise.allSettled(resDocsPromises);
				if (!isPromise(resDocsResponses)) {
					const loadedDocs = resDocsResponses.filter(p => p.status === 'fulfilled');
					const errorDocs = resDocsResponses.filter(p => p.status === 'rejected');
					loadedDocs.forEach((f: any) => {
						if (f.value && f.value.data.id && !loadedFiles.includes(f.value.data.id)) {
							setFilesPdf(prev => [...prev, f.value.data]);
							setLoadedFiles(prev => [...prev, { fileId: f.value.data.id, theme: null }]);
						}
					});
					if (errorDocs.length > 0) setManualError(errorDocs.map((err: any) => err.reason));
					setIsLoading(false);
				}
			}
			switch (theme) {
				case 'light':
					const resLightFilesPromises = images.map(async file => {
						const fD = new FormData();
						fD.append('file', file as File);

						if (file.type && !file.type.includes('pdf')) {
							try {
								const res = await axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
									headers: {
										Authorization: `Bearer ${storedToken}`
									}
								});

								return res;
							} catch (e) {
								const err = checkAxiosError(e);
								throw err;
							}
						}
					});
					const resLightFilesResponses = await Promise.allSettled(resLightFilesPromises);
					if (!isPromise(resLightFilesResponses)) {
						const loadedLightFiles = resLightFilesResponses.filter(p => p.status === 'fulfilled');
						const errorLightFiles = resLightFilesResponses.filter(p => p.status === 'rejected');
						loadedLightFiles.forEach((f: any) => {
							if (f.value.data.id && !loadedFiles.includes(f.value.data.id)) {
								setFilesLight(prev => [...prev, f.value.data]);
								setLoadedFiles(prev => [...prev, { fileId: f.value.data.id, theme }]);
							}
						});
						if (errorLightFiles.length > 0) setManualError(errorLightFiles.map((err: any) => err.reason));
					}
					setIsLoading(false);
					break;
				case 'dark':
					const resDarkFilesPromises = images.map(async file => {
						const fD = new FormData();
						fD.append('file', file as File);

						if (file.type && !file.type.includes('pdf')) {
							try {
								const res = await axios.post(`${authConfig.baseApiUrl}/files/upload-image`, fD, {
									headers: {
										Authorization: `Bearer ${storedToken}`
									}
								});

								return res;
							} catch (e) {
								const err = checkAxiosError(e);
								throw err;
							}
						}
					});
					const resDarkFilesResponses = await Promise.allSettled(resDarkFilesPromises);
					if (!isPromise(resDarkFilesResponses)) {
						const loadedDarkFiles = resDarkFilesResponses.filter(p => p.status === 'fulfilled');
						const errorDarkFiles = resDarkFilesResponses.filter(p => p.status === 'rejected');
						loadedDarkFiles.forEach((f: any) => {
							if (f.value.data.id && !loadedFiles.includes(f.value.data.id)) {
								setFilesDark(prev => [...prev, f.value.data]);
								setLoadedFiles(prev => [...prev, { fileId: f.value.data.id, theme }]);
							}
						});
						if (errorDarkFiles.length > 0) setManualError(errorDarkFiles.map((err: any) => err.reason));
					}
					setIsLoading(false);
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
	const renderFilePreview = (file: DeepMergeTwoTypes<FileProp, ArticleFileType>) => {
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
		} else if (
			(!!file.type && !file.type.startsWith('image')) ||
			(!!file.path && file.extension?.includes('pdf'))
		) {
			return (
				<Tooltip title={file.name} placement='top' arrow>
					<Box sx={{ width: '64px', maxWidth: '64px', overflow: 'hidden' }}>
						<Icon icon='mdi:file-document-outline' />
						<Typography
							sx={{ width: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
						>
							{file.name}
						</Typography>
					</Box>
				</Tooltip>
			);
		} else {
			return <Icon icon='mdi:file-document-outline' />;
		}
	};
	const handleRemoveFile = async (file: DeepMergeTwoTypes<ArticleFileType, File>) => {
		if (file?.id && !filesToDelete.current.includes(file.id)) {
			filesToDelete.current.push(file.id);
		}
		if (file.id) {
			setIsLoading(true);
			const isDoc = Boolean(filesPdf.find((i: FileProp) => i.id === file.id));
			const isLight = Boolean(filesLight.find((i: FileProp) => i.id === file.id));
			const isDark = Boolean(filesDark.find((i: FileProp) => i.id === file.id));

			if (isDoc) setFilesPdf(prev => prev.filter((i: FileProp) => i.id !== file.id));
			if (isLight) setFilesLight(prev => prev.filter((i: FileProp) => i.id !== file.id));
			if (isDark) setFilesDark(prev => prev.filter((i: FileProp) => i.id !== file.id));
			setIsLoading(false);
		}
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
		loadedFiles.forEach(file => handleRemoveFile({ id: file.fileId, name: '' }));
	};

	const onSubmit = async (values: ArticleType) => {
		setIsLoading(true);
		if (!!existingArticle) {
			const res = await dispatch(
				editArticle({
					articleId: values.id,
					localeId: settings.localeId,
					isPublished: values.isPublished,
					typeId: values.typeId,
					localeContent: {
						localeId: settings.localeId,
						title: values.title,
						text: values.text,
						videoLink: values.videoLink,
						files: loadedFiles
					}
				})
			);
			if (res.payload.status === 200) {
				handleClose();
				toast.success('Статья успешно изменена');
				if (filesToDelete.current.length > 0) {
					filesToDelete.current.forEach(
						async id =>
							await axios.delete(`${authConfig.baseApiUrl}/files/${id}`, {
								headers: {
									Authorization: `Bearer ${storedToken}`
								}
							})
					);
				}
				setIsLoading(false);
			} else if (isAxiosError(res.payload)) {
				if (res.payload.response?.data.message) {
					const err = res.payload.response?.data.message;
					if (Array.isArray(err)) {
						err.map(e => toast.error(e));
					} else toast.error(err);
					handleClose();
				}
			}
		} else {
			try {
				const res = await dispatch(
					createArticle({
						localeId: settings.localeId,
						isPublished: values.isPublished,
						typeId: values.typeId,
						localeContent: {
							title: values.title,
							text: values.text,
							videoLink: values.videoLink,
							files: loadedFiles,
							localeId: settings.localeId
						}
					})
				);
				if (res.payload.status === 201) {
					toast.success('Статья успешно создана');
					handleClose();
					setIsLoading(false);
					form.reset();
					setFilesLight([]);
					setFilesDark([]);
					setFilesPdf([]);
					setLoadedFiles([]);
				} else if (isAxiosError(res.payload)) {
					if (res.payload.response?.data.message) {
						const err = res.payload.response?.data.message;
						if (Array.isArray(err)) {
							err.map(e => toast.error(e));
						} else toast.error(err);
						handleClose();
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
	};

	useEffect(() => {
		setManualError('');
	}, [filesDark.length, filesLight.length, filesPdf.length]);

	useEffect(() => {
		setIsLoading(true);
		if (filesToDelete.current.length > 0) {
			filesToDelete.current.forEach(file => {
				setLoadedFiles(prev => prev.filter(i => i.fileId !== file));
			});
		}
		setIsLoading(false);
	}, [filesToDelete.current.length]);

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
									name='text'
									control={form.control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											multiline
											rows={5}
											error={Boolean(form.formState.errors.text)}
											label={<Translations text='articles.text' locale='labels' />}
											{...field}
										/>
									)}
								/>
								{form.formState.errors.text && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.text.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<InputLabel error={Boolean(form.formState.errors.typeId)}>
									<Translations text='type' locale='labels' />
								</InputLabel>
								<Controller
									name='typeId'
									control={form.control}
									rules={{ required: true }}
									render={({ field }) => (
										<Select
											error={Boolean(form.formState.errors.typeId)}
											label={<Translations text='type' locale='labels' />}
											{...field}
										>
											{data?.map((val: ArticleTypeType) => (
												<MenuItem key={val.id} value={val.id}>
													{val.localeContent ? val.localeContent[0].displayName : val.name}
												</MenuItem>
											))}
										</Select>
									)}
								/>
								{form.formState.errors.typeId && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.typeId.message}
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
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='videoLink'
									control={form.control}
									rules={{ required: false }}
									render={({ field }) => (
										<TextField
											error={Boolean(form.formState.errors.videoLink)}
											label={<Translations text='articles.videoLink' locale='labels' />}
											{...field}
										/>
									)}
								/>
								{form.formState.errors.videoLink && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.videoLink.message}
									</FormHelperText>
								)}
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
						<Grid item xs={12}>
							{Array.isArray(manualError) ? (
								manualError.map((err, i) => (
									<Typography key={i} variant='body2' sx={{ my: 2 }} color='error'>
										{err}
									</Typography>
								))
							) : (
								<Typography variant='body2' sx={{ my: 2 }} color='error'>
									{manualError}
								</Typography>
							)}

							{filesPdf.length ? (
								<>
									<List
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr' }
										}}
									>
										<FileList files={filesPdf} />
									</List>
								</>
							) : null}
						</Grid>
						<Grid item xs={12} sm={6}>
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
						{filesLight.length + filesDark.length + filesPdf.length > 0 && (
							<Grid item xs={12}>
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Typography sx={{ mx: 2 }}>
										{filesLight.length + filesDark.length + filesPdf.length} / {MAX_FILES}
									</Typography>
									<Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
										<Translations text='Delete' locale='buttons' />{' '}
										<Translations text='all' locale='labels' />
									</Button>
								</Box>
							</Grid>
						)}
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

export default ArticleForm;

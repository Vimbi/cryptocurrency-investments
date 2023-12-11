import { FC, Fragment, useEffect, useState } from 'react';
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
	InputLabel,
	Select,
	MenuItem,
	IconButton
} from '@mui/material';
import Icon from 'src/@core/components/icon';
import { ArticleTypeType, LocaleType } from 'src/types/apps/articleTypes';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createArticleType, editArticleType } from 'src/store/apps/articleTypes';
import { toast } from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import Translations from 'src/layouts/components/Translations';
import { isAxiosError } from 'axios';

interface IProps {
	existingArticle?: ArticleTypeType;
	locales?: LocaleType[];
	open: boolean;
	onClose: () => void;
}

const schema = yup.object().shape({
	name: yup.string().required()
});

const ArticleTypeForm: FC<IProps> = ({ existingArticle, locales, open, onClose }) => {
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<ArticleTypeType>({
		defaultValues: { name: '', localeContent: [{ localeId: '', displayName: '' }] },
		mode: 'onChange',
		resolver: yupResolver(schema)
	});
	const { append, remove, fields } = useFieldArray({
		name: 'localeContent',
		control: form.control
	});
	const dispatch = useDispatch<AppDispatch>();

	const handleClose = () => {
		onClose();
	};

	useEffect(() => {
		if (!!existingArticle) {
			form.reset(existingArticle);
		}
	}, []);
	const onSubmit = async (values: ArticleTypeType) => {
		// setIsLoading(true);
		if (!!existingArticle) {
			const differentValues = { ...values };
			for (const key in values) {
				const tkey = key as keyof ArticleTypeType;
				if (values[tkey] === existingArticle[tkey]) {
					delete differentValues[tkey];
				}
			}
			const res = await dispatch(editArticleType({ id: values.id, ...differentValues }));
			if (res.payload.status === 200) {
				handleClose();
				toast.success('Тип статей успешно изменен');
				setIsLoading(false);
			} else if (isAxiosError(res.payload)) {
				if (res.payload.response?.data.message) {
					const err = res.payload.response?.data.message;
					if (Array.isArray(err)) {
						err.map(e => toast.error(e));
					} else {
						toast.error(err);
					}
				} else {
					toast.error(<Translations text='error' locale='labels' />);
				}
				handleClose();
			}
		} else {
			const res = await dispatch(createArticleType(values));
			if (res.payload.status === 201) {
				handleClose();
				toast.success('Тип статей успешно создан');
				setIsLoading(false);
				form.reset();
			} else if (isAxiosError(res.payload)) {
				if (res.payload.response?.data.message) {
					const err = res.payload.response?.data.message;
					if (Array.isArray(err)) {
						err.map(e => toast.error(e));
					} else {
						toast.error(err);
					}
				} else {
					toast.error(<Translations text='error' locale='labels' />);
				}
				handleClose();
			}
		}
	};

	return (
		<Dialog maxWidth='sm' fullWidth onClose={handleClose} open={open}>
			<DialogTitle>
				<Translations text='ArticleTable.types' locale='buttons' />
			</DialogTitle>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<DialogContent>
					<Grid container spacing={5}>
						<Grid item xs={12}>
							<FormControl fullWidth>
								<Controller
									name='name'
									control={form.control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											error={Boolean(form.formState.errors.name)}
											label={<Translations text='articles.codeName' locale='labels' />}
											{...field}
											placeholder='news'
										/>
									)}
								/>
								{form.formState.errors.name && (
									<FormHelperText sx={{ color: 'error.main' }}>
										{form.formState.errors.name.message}
									</FormHelperText>
								)}
							</FormControl>
						</Grid>
						{fields.map((name, i) => (
							<Fragment key={name.id}>
								<Grid item xs={5}>
									<FormControl fullWidth>
										<InputLabel error={Boolean(form.formState.errors.localeContent)}>
											<Translations text='locales' locale='labels' />
										</InputLabel>
										<Controller
											name={`localeContent.${i}.localeId` as 'localeContent.0.localeId'}
											control={form.control}
											rules={{ required: true }}
											render={({ field }) => (
												<Select
													error={Boolean(form.formState.errors.localeContent)}
													label={<Translations text='locales' locale='labels' />}
													{...field}
												>
													{locales?.map((val: ArticleTypeType) => (
														<MenuItem key={val.id} value={val.id}>
															{`${val.name} | ${val.displayName}`}
														</MenuItem>
													))}
												</Select>
											)}
										/>
										{form.formState.errors.localeContent && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{form.formState.errors.localeContent.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={6}>
									<FormControl fullWidth>
										<Controller
											name={`localeContent.${i}.displayName` as 'localeContent.0.displayName'}
											control={form.control}
											rules={{ required: true }}
											render={({ field }) => (
												<TextField
													error={Boolean(form.formState.errors.localeContent)}
													label={<Translations text='displayName' locale='labels' />}
													{...field}
													placeholder='Новости'
												/>
											)}
										/>
										{form.formState.errors.localeContent && (
											<FormHelperText sx={{ color: 'error.main' }}>
												{form.formState.errors.localeContent.message}
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
								<Grid item xs={1} alignSelf='center'>
									<IconButton color='error' size='small' onClick={() => remove(i)}>
										<Icon icon='mdi:minus' />
									</IconButton>
								</Grid>
							</Fragment>
						))}

						{locales && fields.length < locales?.length && (
							<Grid item xs={12}>
								<Button
									fullWidth
									variant='outlined'
									onClick={() =>
										append({
											localeId: '',
											displayName: '',
											typeId: '',
											updatedAt: null,
											createdAt: ''
										})
									}
								>
									<Translations text='Add' locale='buttons' />
								</Button>
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

export default ArticleTypeForm;

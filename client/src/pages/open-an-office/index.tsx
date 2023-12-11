import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	Button,
	FormControl,
	TextField,
	FormHelperText
} from '@mui/material';
import { ReactNode } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { useForm, Controller } from 'react-hook-form';
import { NextPage } from 'next';
import Image from 'next/image';
import { MuiTelInput } from 'mui-tel-input';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import { toast } from 'react-hot-toast';
import { parseErrors } from 'src/@core/utils/parseErrors';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import * as cookie from 'cookie';

const OpenAnOffice: NextPage = () => {
	const form = useForm({ defaultValues: { name: '', surname: '', email: '', phone: '', note: '' } });

	const handleSubmit = async (values: any) => {
		try {
			const resData = await axios.post(`${authConfig.baseApiUrl}/office-opening-requests`, values);
			if (resData.status === 201) {
				toast.success('Заявка успешно отправлена');
				form.reset();
			}
		} catch (e) {
			if (isAxiosError(e) && e.response?.data.message) {
				const error = parseErrors(e.response?.data.message);
				error.forEach((e: any) => form.setError(e.key, { message: e.message }));
			}
		}
	};

	return (
		<>
			<Typography sx={{ mt: 8 }} fontWeight='bold' variant='h3'>
				<Translations text='OpenOffice' locale='navigation' />
			</Typography>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					gap: 5,
					mt: 8,
					alignItems: { xs: 'center' },
					flexDirection: { xs: 'column-reverse', md: 'row' }
				}}
			>
				<Typography variant='body1' sx={{ width: { md: '100%' }, whiteSpace: 'pre-wrap' }}>
					<Translations text='OpenOfficeDescription' locale='common' />
				</Typography>
				<Box sx={{ position: 'relative', height: 'auto', width: { xs: '100%', sm: '80%', md: '70%' } }}>
					<Image
						style={{ width: '100%', height: 'auto' }}
						src='/images/open-an-office.jpg'
						alt='open an office'
						width={570}
						height={480}
					/>
				</Box>
			</Box>
			<Card sx={{ mt: { xs: 20, md: 30 }, p: { xs: 0, md: 10 } }}>
				<CardContent>
					<Typography fontWeight='bold' sx={{ mb: { xs: 5, sm: 6, lg: 8 } }} variant='h3'>
						<Translations text='OpenOfficeForm' locale='common' />
					</Typography>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<Grid container spacing={5}>
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth>
									<Controller
										name='name'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												label={<Translations text='name' locale='labels' />}
												error={Boolean(form.formState.errors.name)}
												value={value}
												onChange={onChange}
											/>
										)}
									/>
								</FormControl>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth>
									<Controller
										name='surname'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												label={<Translations text='surname' locale='labels' />}
												error={Boolean(form.formState.errors.surname)}
												value={value}
												onChange={onChange}
											/>
										)}
									/>
								</FormControl>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth>
									<Controller
										name='phone'
										control={form.control}
										rules={{ required: true }}
										render={({ field }) => (
											<MuiTelInput
												sx={{ display: 'flex' }}
												{...field}
												error={Boolean(form.formState.errors.phone)}
												disableDropdown
												forceCallingCode
												defaultCountry='RU'
											/>
										)}
									/>
									{form.formState.errors.phone && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{form.formState.errors.phone?.message}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth>
									<Controller
										name='email'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												label='E-mail'
												error={Boolean(form.formState.errors.email)}
												value={value}
												onChange={onChange}
											/>
										)}
									/>
									{form.formState.errors.email && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{form.formState.errors.email?.message}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<FormControl fullWidth>
									<Controller
										name='note'
										control={form.control}
										rules={{ required: true }}
										render={({ field: { value, onChange } }) => (
											<TextField
												multiline
												rows={3}
												label={<Translations text='note' locale='labels' />}
												error={Boolean(form.formState.errors.note)}
												value={value}
												onChange={onChange}
											/>
										)}
									/>
									{form.formState.errors.note && (
										<FormHelperText sx={{ color: 'error.main' }}>
											{form.formState.errors.note?.message}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<Button size='large' fullWidth type='submit' variant='contained'>
									<Translations text='SubmitApplication' locale='buttons' />
								</Button>
							</Grid>
						</Grid>
					</form>
				</CardContent>
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
				['navigation', 'footer', 'common', 'labels', 'buttons'],
				null,
				['ru', 'en']
			))
		}
	};
};

OpenAnOffice.guestGuard = true;
OpenAnOffice.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default OpenAnOffice;

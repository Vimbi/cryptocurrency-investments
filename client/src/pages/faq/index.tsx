import { NextPage } from 'next';
import { ReactNode } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { useForm, Controller } from 'react-hook-form';
import { FAQBlock } from 'src/views/ui/faq-block/ui';
import { Box, Card, CardContent, Typography, Grid, Button, FormControl, TextField } from '@mui/material';
import axios, { isAxiosError } from 'axios';
import authConfig from 'src/configs/auth';
import { toast } from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next/types';
import Translations from 'src/layouts/components/Translations';
import * as cookie from 'cookie';

type MessageHelpdeskType = {
	name: string;
	email: string;
	message: string;
};

const FAQ: NextPage = () => {
	const form = useForm({
		defaultValues: { name: '', email: '', message: '' }
	});

	const onSubmit = async (values: MessageHelpdeskType) => {
		try {
			const resData = await axios.post(`${authConfig.baseApiUrl}/telegram-bot/send-message-helpdesk`, values);
			if (resData.status === 201) {
				toast.success('Сообщение отправлено в службу поддержки');
				form.reset();
			}
		} catch (e) {
			if (isAxiosError(e) && e.response?.data.message) {
				if (e.response.status === 400) {
					e.response.data.message.forEach((mes: string) => toast.error(mes));
				}
				if (e.response.status === 500) {
					toast.error('Ошибка при отправке. Попробуйте позже');
				}
			}
		}
	};

	return (
		<>
			<div className='banner-gap'>
				<FAQBlock />
			</div>
			<div className='banner-gap' id='support'>
				<Card sx={{ p: { xs: 0, lg: 10 } }}>
					<CardContent>
						<Typography fontWeight='bold' sx={{ mb: { xs: 5, sm: 6, lg: 8 } }} variant='h3'>
							<Translations text='Support' locale='common' />
						</Typography>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<Grid container spacing={5}>
								<Grid item xs={12} sm={6}>
									<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 5 }}>
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
										</FormControl>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6}>
									<FormControl fullWidth sx={{ height: '100%' }}>
										<Controller
											name='message'
											control={form.control}
											rules={{ required: true }}
											render={({ field: { value, onChange } }) => (
												<TextField
													InputProps={{ sx: { height: '100%' } }}
													sx={{ height: '100%' }}
													multiline
													label={<Translations text='appealReason' locale='labels' />}
													error={Boolean(form.formState.errors.message)}
													rows={4}
													value={value}
													onChange={onChange}
												/>
											)}
										/>
									</FormControl>
								</Grid>
								{form.formState.errors.root && 'Ошибка'}
								<Grid item xs={12}>
									<Button size='large' fullWidth type='submit' variant='contained'>
										<Translations text='SubmitApplication' locale='buttons' />
									</Button>
								</Grid>
							</Grid>
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'faq', 'footer', 'common', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

FAQ.guestGuard = true;
FAQ.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default FAQ;

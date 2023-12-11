// ** Next Imports
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next/';
import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { NextPage } from 'next';
import { useTheme } from '@mui/material/styles';
import { Typography, Card, CardContent, Button } from '@mui/material';
import authConfig from 'src/configs/auth';
import { SwiperCardsSection } from 'src/views/ui/swiper-section/ui';
import { TeamAdvertisingBanner } from '../views/ui/team-banner/ui';
import { FAQBlock } from 'src/views/ui/faq-block/ui';
import { useAuth } from 'src/hooks/useAuth';
import GuestLayout from 'src/layouts/GuestLayout';
import { ArticleTypeType } from 'src/types/apps/articleTypes';
import axios from 'axios';
import * as cookie from 'cookie';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ data }) => {
	const router = useRouter();
	const theme = useTheme();
	const auth = useAuth();
	const {
		settings: { localeId, mode }
	} = useSettings();

	const [articlesData, setArticlesData] = useState<any>([]);
	const handleGetData = async (typeId: string) => {
		try {
			const res = await axios.get(`${authConfig.baseApiUrl}/articles`, {
				params: {
					typeId,
					localeId,
					theme: mode,
					sort: `["createdAt","DESC"]`
				}
			});
			setArticlesData((prev: any) => ({ ...prev, [typeId]: { data: res.data.entities } }));
		} catch (e) {}
	};

	useEffect(() => {
		if (localeId && data.length > 0) data.map(item => handleGetData(item.id ?? ''));
	}, [data, localeId, mode]);

	return (
		<>
			<div className='large-container'>
				<Card sx={{ overflow: 'visible' }}>
					<CardContent
						className='main-banner'
						sx={{
							backgroundImage:
								theme.palette.mode === 'dark'
									? "url('/images/ellipse-dark.png')"
									: "url('/images/ellipse-light.png')"
						}}
					>
						<div className='container'>
							<div className='width-wrapper'>
								<Typography
									fontWeight='bold'
									variant='h3'
									sx={{ marginBottom: { xs: '20px', sm: '40px', md: '46px' } }}
								>
									<Translations text='MainPageSlogan' locale='main' />
								</Typography>

								<Typography
									variant='subtitle1'
									sx={{ marginBottom: { xs: '20px', sm: '40px', md: '55px' } }}
								>
									<Translations text='MainPageDescription' locale='main' />
								</Typography>
								<div className='btns-wrapper'>
									<Button variant='contained' onClick={() => router.push('/apps/profile/team/')}>
										<Translations text='JoinTheTeam' locale='buttons' />
									</Button>
									{auth?.user ? (
										<Button
											fullWidth
											variant='outlined'
											onClick={() => router.push('/apps/profile/account/')}
										>
											<Translations text='SignIn' locale='buttons' />
										</Button>
									) : (
										<Button fullWidth variant='outlined' onClick={() => router.push('/login')}>
											<Translations text='SignIn' locale='buttons' />
										</Button>
									)}
								</div>
								<div className='numbers'>
									<div className='numbers__card'>
										<Typography variant='body1'>
											<Translations text='InvestNow' locale='main' />
										</Typography>
										<Typography variant='h4'>$1000</Typography>
									</div>
									<div className='numbers__card'>
										<Typography variant='body1'>
											<Translations text='GetInYear' locale='main' />
										</Typography>
										<Typography variant='h4'>$3400</Typography>
									</div>
								</div>
							</div>
						</div>

						<Image className='coins' src='/images/coins.png' alt='coins banner' width={720} height={720} />
					</CardContent>
				</Card>
				<div className='main-banner_bottom'>
					<Card>
						<CardContent>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<div
									style={{ width: '100%', maxWidth: 'calc((1200px/2) - 2rem)' }}
									className='numbers__card'
								>
									<Image src='/images/dollar-frame.svg' alt='percent' width={56} height={56} />
									<Typography variant='body1'>
										<Translations text='AnnualInterest' locale='main' />
									</Typography>
									<Typography variant='h4'>240%</Typography>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card></Card>
				</div>
			</div>
			<div className='banner-gap'>
				<div className='text-wrapper'>
					<Typography variant='h3' sx={{ maxWidth: '640px', fontWeight: 600 }}>
						<Translations text='SecondBannerTitle' locale='main' />
					</Typography>
					<Typography variant='body2' sx={{ maxWidth: '640px' }}>
						<Translations text='SecondBannerDescription' locale='main' />
					</Typography>
				</div>
				<div className='card-grid'>
					<Card>
						<CardContent className='card'>
							<Image src='/images/waterfall-chart-frame.svg' alt='percent' width={56} height={56} />
							<p>
								<Translations text='SecondBannerCard1' locale='main' />
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='card'>
							<Image src='/images/alt-route-frame.svg' alt='percent' width={56} height={56} />
							<p>
								<Translations text='SecondBannerCard2' locale='main' />
							</p>
						</CardContent>
					</Card>
					<Card className='large-grid-card'>
						<CardContent className='card'>
							<Image src='/images/work-case-frame.svg' alt='percent' width={56} height={56} />
							<p style={{ paddingRight: '5%' }}>
								<Translations text='SecondBannerCard3' locale='main' />
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='card'>
							<Image src='/images/grain-frame.svg' alt='percent' width={56} height={56} />
							<p>
								<Translations text='SecondBannerCard4' locale='main' />
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className='card'>
							<Image src='/images/groups-frame.svg' alt='percent' width={56} height={56} />
							<p>
								<Translations text='SecondBannerCard5' locale='main' />
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
			<div className='banner-gap'>
				<Card
					className='banner-two'
					sx={{
						backgroundImage:
							theme.palette.mode === 'dark'
								? "url('/images/ellipse-dark.png')"
								: "url('/images/ellipse-light.png')"
					}}
				>
					<CardContent>
						<div className='container'>
							<div>
								<Typography className='grid-two__top' variant='h3' sx={{ fontWeight: 600 }}>
									<Translations text='ThirdBannerVol1' locale='main' />
								</Typography>
								<div className='grid-two'>
									<Image
										src='/images/safe-deposit.png'
										alt='сейф'
										width={450}
										height={380}
										style={{ float: 'left' }}
									/>

									<Typography variant='h3' style={{ textAlign: 'left' }} sx={{ fontWeight: 600 }}>
										<Translations text='ThirdBannerVol2' locale='main' />
									</Typography>
									<Button fullWidth variant='contained' onClick={() => router.push('/register')}>
										<Translations text='JoinTheTeam' locale='buttons' />
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			{Object.keys(articlesData).map((article: any) => {
				const currentType = data.find(item => item.id === article);
				if (articlesData[article].data.length > 0) {
					return (
						<div key={articlesData[article].typeId} className='banner-gap'>
							<SwiperCardsSection
								title={
									currentType?.localeContent?.find(t => t.localeId === localeId)?.displayName ?? ''
								}
								extendedPageLink={`/article/${currentType?.name}`}
								data={articlesData[article].data}
							/>
						</div>
					);
				} else return;
			})}
			<div className='banner-gap'>
				<FAQBlock />
			</div>
			<div className='banner-gap'>
				<TeamAdvertisingBanner onClick={() => router.push('/register')} />
			</div>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<{
	data: ArticleTypeType[];
}> = async (context: any) => {
	const res = await fetch(`${authConfig.baseApiUrl}/article-types`, {
		method: 'GET'
	});
	const repo = await res.json();
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			data: repo,
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'main', 'buttons', 'faq', 'footer'],
				null,
				['ru', 'en']
			))
		}
	};
};

Home.guestGuard = true;
Home.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default Home;

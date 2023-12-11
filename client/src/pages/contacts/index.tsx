import { NextPage } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { Box, Grid, Typography } from '@mui/material';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import * as cookie from 'cookie';

const TELEGRAM_LINKS = [
	{ href: 'https://t.me/nephritetradeEs', label: 'Spain' },
	{ href: 'https://t.me/nephritetradePt', label: 'Portugal' },
	{ href: 'https://t.me/nephritetradeFra', label: 'France' },
	{ href: 'https://t.me/nephritetradeGer', label: 'Germany' },
	{ href: 'https://t.me/nephritetradeEng', label: 'England' },
	{ href: 'https://t.me/nephritetraderus', label: 'Russia' }
];

const YOUTUBE_LINKS = [
	{ href: 'https://youtube.com/@NephriteTradeEsl?si=RqwNaaX8gz6gvqrR', label: 'Spain' },
	{ href: 'https://youtube.com/@NephriteTradePor?si=gtC7lvW2cAvSwlQz', label: 'Portugal' },
	{ href: 'https://youtube.com/@NephriteTradeFra?si=V2kv-OONNYybXRnV', label: 'France' },
	{ href: 'https://youtube.com/@NephriteTradeGer?si=5Y4PAuwGzFIyopWK', label: 'Germany' },
	{ href: 'https://youtube.com/@NephriteTradeEng?si=3_xEmqskTQwT0sBf', label: 'England' },
	{ href: 'https://youtube.com/@Nephritetraderu?si=gLXn_APyhciwbmxc', label: 'Russia' }
];

const Contacts: NextPage = () => {
	return (
		<>
			<Typography sx={{ mt: 8 }} fontWeight='bold' variant='h2'>
				<Translations text='Contacts' locale='navigation' />
			</Typography>
			<Grid container spacing={6} sx={{ mt: { xs: 8 }, '& a': { color: 'primary.main' } }}>
				<Grid item xs={12} md={6}>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
						<Typography fontWeight={600} variant='h3'>
							Telegram
						</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
							{TELEGRAM_LINKS.map(link => (
								<Link key={link.label} target='blank' href={link.href}>
									{link.label}
								</Link>
							))}
						</Box>
					</Box>
				</Grid>
				<Grid item xs={12} md={6}>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
						<Typography fontWeight={600} variant='h3'>
							Youtube
						</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
							{YOUTUBE_LINKS.map(link => (
								<Link key={link.label} target='blank' href={link.href}>
									{link.label}
								</Link>
							))}
						</Box>
					</Box>
				</Grid>
			</Grid>
			<Grid container spacing={6} sx={{ mt: { xs: 8 }, '& a': { color: 'primary.main' } }}>
				<Grid item xs={12} md={6}>
					<Typography fontWeight={600} variant='h3'>
						<Link target='blank' href='https://instagram.com/nephrite_trade?igshid=OGQ5ZDc2ODk2ZA=='>
							Instagram
						</Link>
					</Typography>
				</Grid>
				<Grid item xs={12} md={6}>
					<Typography fontWeight={600} variant='h3'>
						<Link target='blank' href='https://x.com/nephritetrade?s=21'>
							Twitter
						</Link>
					</Typography>
				</Grid>
			</Grid>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(lang ?? context.locale, ['navigation', 'footer'], null, ['ru', 'en']))
		}
	};
};

Contacts.guestGuard = true;
Contacts.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default Contacts;

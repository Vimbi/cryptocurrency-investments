import { GetServerSideProps } from 'next/types';
import { NextPage } from 'next';
import { ReactNode, useEffect, useState } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { Box, Typography } from '@mui/material';
import authConfig from 'src/configs/auth';
import PricingPlans from 'src/views/pages/pricing/PricingPlans';
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import * as cookie from 'cookie';
import { useSettings } from 'src/@core/hooks/useSettings';
import axios from 'axios';

function getImageLink(displayName: string) {
	let link = '/images/pages/pricing-plans-';
	const dName = displayName.toLowerCase();
	if (dName === 'standart' || dName === 'standard') {
		link += '1.jpg';
	} else if (dName === 'gold') {
		link += '2.jpg';
	} else if (dName === 'vip') {
		link += '3.jpg';
	} else if (dName === 'platinum') {
		link += '4.jpg';
	} else {
		link = '';
	}

	return link;
}

const ProductsTarifInfo: NextPage = () => {
	const {
		settings: { localeId }
	} = useSettings();
	const [data, setData] = useState<ProductTarifType[] | null>(null);

	const getProducts = async () => {
		const res = await axios.get(`${authConfig.baseApiUrl}/products?sort=["price","ASC"]`, {
			params: {
				sort: '["price","ASC"]',
				localeId
			}
		});
		if (res.status === 200)
			setData(
				res.data.entities.map((d: ProductTarifType) => ({ ...d, imgSrc: getImageLink(d.displayName) })) ?? null
			);
	};

	useEffect(() => {
		if (localeId) getProducts();
	}, [localeId]);

	return (
		<>
			<Typography sx={{ mt: 8 }} fontWeight='bold' variant='h3'>
				<Translations text='Products' locale='navigation' />
			</Typography>
			<Box sx={{ mt: 8 }}>
				<PricingPlans data={data} />
			</Box>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'footer', 'buttons', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

ProductsTarifInfo.guestGuard = true;
ProductsTarifInfo.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default ProductsTarifInfo;

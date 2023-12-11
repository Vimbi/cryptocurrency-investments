import { NextPage } from 'next';
import * as cookie from 'cookie';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import PricingPlans from 'src/views/pages/pricing/PricingPlans';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { useState, useEffect } from 'react';
import { fetchData } from 'src/store/apps/tarif';
import { ProductTarifType } from 'src/types/apps/tarifTypes';
import { GetServerSideProps } from 'next/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import { useSettings } from 'src/@core/hooks/useSettings';

const Tarrifs: NextPage = () => {
	const {
		settings: { localeId }
	} = useSettings();
	const [pageSize] = useState<number>(10);
	const [currentPage] = useState<number>(0);
	const [data, setData] = useState<ProductTarifType[]>();
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
	const dispatch = useDispatch<AppDispatch>();
	const store = useSelector((state: RootState) => state.tarif);
	useEffect(() => {
		dispatch(
			fetchData({
				limit: pageSize,
				page: currentPage + 1,
				localeId
			})
		);
	}, [dispatch, currentPage, pageSize, localeId]);

	useEffect(() => {
		if (store.data.length > 0) {
			setData(
				store.data
					.map((item: ProductTarifType) => {
						const updateImage = { ...item, imgSrc: getImageLink(item.displayName) };

						return updateImage;
					})
					.sort(function (a, b) {
						return a.price - b.price;
					})
			);
		}
	}, [store.data]);

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader title={<Translations text='Rates' locale='navigation' />} />
					<CardContent>{data && data.length > 0 ? <PricingPlans data={data} /> : ''}</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(context.req.headers?.cookie ?? '')?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['navigation', 'buttons', 'footer', 'labels', 'common'],
				null,
				['ru', 'en']
			))
		}
	};
};

Tarrifs.acl = {
	subject: 'tariffs',
	action: 'read'
};

export default Tarrifs;

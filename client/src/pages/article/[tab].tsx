import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import GuestLayout from 'src/layouts/GuestLayout';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { TabContext } from '@mui/lab';
import axios from 'axios';
import authConfig from 'src/configs/auth';
import { ArticleType, ArticleTypeType } from 'src/types/apps/articleTypes';
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next/types';
import ArticleTabs from 'src/views/pages/article/ArticleTabs';
import ArticleContent from 'src/views/pages/article/ArticleContent';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Translations from 'src/layouts/components/Translations';
import * as cookie from 'cookie';
import { useSettings } from 'src/@core/hooks/useSettings';

interface Props {
	tab: string | string[] | undefined;
	typeTabs: ArticleTypeType[];
}

const AcademyNews: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ tab, typeTabs }) => {
	const router = useRouter();
	const {
		settings: { localeId, mode }
	} = useSettings();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [limit, setLimit] = useState(10);
	const [data, setData] = useState<{
		entities: ArticleType[];
		itemCount: number;
		limit: number;
		page: number;
	} | null>();

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setIsLoading(true);
		setData(null);
		router.push('/article/' + newValue);
	};

	const handleGetData = async (id?: string) => {
		try {
			const res = await axios.get(`${authConfig.baseApiUrl}/articles`, {
				params: {
					limit,
					localeId,
					theme: mode,
					typeId: id
				}
			});
			setData(res.data);
		} catch (e) {
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const id = typeTabs?.find(item => item.name === tab)?.id;
		if (mode && localeId) handleGetData(id);
	}, [tab, typeTabs, limit, localeId, mode]);

	return (
		<>
			<Typography sx={{ mt: 8 }} fontWeight='bold' variant='h3'>
				<Translations text='News_Academy' locale='navigation' />
			</Typography>
			<TabContext value={tab as string}>
				<ArticleTabs onChange={handleChange} typeTabs={typeTabs} />
				{isLoading ? (
					<Box
						sx={{
							pt: 12,
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<CircularProgress size={40} />
					</Box>
				) : !isLoading && !data?.entities.length ? (
					<Box
						sx={{
							pt: 12,
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Typography>
							<Translations text='NothingYet' />
						</Typography>
					</Box>
				) : (
					<ArticleContent artices={data?.entities} />
				)}
				{!!data && !(data.limit * data.page >= data?.itemCount) && (
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<Button
							variant='contained'
							sx={{ mt: 5, width: { xs: '100%', sm: 'fit-content' } }}
							onClick={() => setLimit(prev => prev + 10)}
						>
							<Translations text='ShowMore' locale='buttons' />
						</Button>
					</Box>
				)}
			</TabContext>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
	params,
	locale,
	req
}: GetServerSidePropsContext) => {
	const res = (await axios.get<ArticleTypeType[]>(`${authConfig.baseApiUrl}/article-types`)).data;
	const lang = cookie.parse(`${req?.headers?.cookie}`)?.lang;

	return {
		props: {
			tab: params?.tab,
			typeTabs: res,
			...(await serverSideTranslations(
				`${lang ?? locale}`,
				['common', 'navigation', 'buttons', 'footer', 'labels'],
				null,
				['ru', 'en']
			))
		}
	};
};

AcademyNews.guestGuard = true;

AcademyNews.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;

export default AcademyNews;

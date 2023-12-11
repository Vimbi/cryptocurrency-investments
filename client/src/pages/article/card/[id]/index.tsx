import { GetServerSideProps } from 'next/';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import Icon from 'src/@core/components/icon';
import { Breadcrumbs, Typography, Box, Chip, Tooltip } from '@mui/material';
import GuestLayout from 'src/layouts/GuestLayout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import authConfig from 'src/configs/auth';
import { AcademyNewsCard } from 'src/views/ui/swiper-section/card-ui';
import { ArticleType } from 'src/types/apps/articleTypes';
import { useTheme } from '@mui/material/styles';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import axios from 'axios';
import Translations from 'src/layouts/components/Translations';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as cookie from 'cookie';
import { useSettings } from 'src/@core/hooks/useSettings';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
const AcademyNewsDetailPage = () => {
	const [data, setData] = useState<ArticleType>();
	const [seeAlso, setSeeAlso] = useState<ArticleType[]>();
	const {
		settings: { localeId, mode }
	} = useSettings();
	const theme = useTheme();

	const router = useRouter();
	const id = router.query.id;
	const images = data?.articleFiles?.filter(file => !file.file.extension?.includes('pdf'));
	const docs = data?.articleFiles?.filter(file => file.file.extension?.includes('pdf'));
	const content = data?.localeContent.length > 0 ? data?.localeContent[0] : null;
	const typeId = data?.typeId;
	const [ref] = useKeenSlider<HTMLDivElement>({
		mode: 'free',
		rtl: true,
		breakpoints: {
			'(min-width: 0px)': {
				slides: {
					perView: 2,
					spacing: 16
				}
			},
			'(min-width:940px)': {
				slides: {
					perView: 3,
					spacing: 16
				}
			}
		}
	});

	const handleGetData = async () => {
		const res = await axios.get(`${authConfig.baseApiUrl}/articles/one`, {
			params: {
				articleId: id,
				localeId,
				theme: mode
			}
		});
		setData(res.data);
	};

	useEffect(() => {
		if (id && localeId && mode) handleGetData();
	}, [id, localeId, mode]);

	const handleGetAlsoItems = async (typeId: string) => {
		const res = await axios.get(`${authConfig.baseApiUrl}/articles`, {
			params: { typeId, localeId, theme: mode }
		});
		setSeeAlso(res.data.entities.filter((item: ArticleType) => item.id !== id));
	};

	useEffect(() => {
		if (typeId && mode && localeId) handleGetAlsoItems(typeId);
	}, [typeId, localeId, mode]);

	return (
		<>
			<div className='container'>
				<Breadcrumbs sx={{ mt: 16 }} separator={<NavigateNextIcon fontSize='small' />}>
					<Link style={{ color: `rgb(${theme.palette.customColors.main})` }} href={'/article/all'}>
						<Translations text='News_Academy' locale='navigation' />
					</Link>
					<Typography>{content?.title}</Typography>
				</Breadcrumbs>
				<Typography variant='h4' sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: { xs: 8, sm: 10, md: 6 } }}>
					{content?.title}
				</Typography>
				<Box sx={{ width: '100%', maxWidth: '75rem', overflow: 'hidden', borderRadius: 2 }}>
					{content?.videoLink && (
						<ReactPlayer
							width='100%'
							controls={true}
							style={{ maxHeight: 675 }}
							height='calc((100vw / 16) * 9)'
							url={content.videoLink}
							pip={true}
						/>
					)}
				</Box>

				{!!images &&
					(images.length > 0 && images.length > 2 ? (
						<Box ref={ref} className='keen-slider'>
							{images.map(image => (
								<Box
									key={image.fileId}
									sx={{
										position: 'relative',
										width: '100%',
										maxWidth: '46.4375rem',
										height: 'calc((100vw / 16) * 9)',
										maxHeight: '26.0625rem',
										borderRadius: 2,
										overflow: 'hidden',
										mt: { xs: 8, sm: 10, md: 6 }
									}}
									className='keen-slider__slide'
								>
									<Image
										style={{ objectFit: 'cover' }}
										src={image.file.path}
										alt={`${content?.title}`}
										fill
									/>
								</Box>
							))}
						</Box>
					) : (
						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
						>
							{images.map(image => (
								<Box
									key={image.fileId}
									sx={{
										position: 'relative',
										width: '100%',
										maxWidth: '46.4375rem',
										height: 'calc((100vw / 16) * 9)',
										maxHeight: '26.0625rem',
										borderRadius: 2,
										overflow: 'hidden',
										mt: { xs: 8, sm: 10, md: 6 }
									}}
								>
									<Image
										style={{ objectFit: 'cover' }}
										src={image.file.path}
										alt={`${content?.title}`}
										fill
									/>
								</Box>
							))}
						</Box>
					))}
				<Box sx={{ mt: { xs: 5, sm: 6, md: 8 } }}>
					<Typography sx={{ whiteSpace: 'pre-wrap' }} variant='body1'>
						{content?.text}
					</Typography>
				</Box>
				{!!docs && docs.length > 0 && (
					<Box sx={{ mt: 8 }}>
						<Typography variant='h6'>
							<Translations text='AttachedFiles' locale='common' />
						</Typography>

						<Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap' }}>
							{docs.map(doc => (
								<Tooltip key={doc.fileId} title={doc.file.name} arrow>
									<Chip
										color='primary'
										variant='outlined'
										sx={{ maxWidth: 150, mr: 4, mb: 4, '& svg': { minWidth: 20 } }}
										clickable
										component='a'
										target='blank'
										href={doc.file.path}
										download={true}
										label={doc.file.name}
										icon={<Icon icon='mdi:file-document-outline' />}
										deleteIcon={<Icon icon='mdi:download' />}
										onDelete={() => doc.file.path}
									/>
								</Tooltip>
							))}
						</Box>
					</Box>
				)}
				<div className='banner-gap'>
					<Typography sx={{ mb: 8 }} fontWeight='bold' variant='h4'>
						<Translations text='SeeAlso' />
					</Typography>
					{!!seeAlso && seeAlso.length > 0 && (
						<Box
							sx={{
								display: 'grid',
								gap: 4,
								gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }
							}}
						>
							{seeAlso.map(item => (
								<AcademyNewsCard key={item.id} data={item} />
							))}
						</Box>
					)}
				</div>
			</div>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
	const lang = cookie.parse(`${context.req?.headers?.cookie}`)?.lang;

	return {
		props: {
			...(await serverSideTranslations(
				lang ?? context.locale,
				['common', 'navigation', 'footer', 'buttons'],
				null,
				['ru', 'en']
			))
		}
	};
};

AcademyNewsDetailPage.guestGuard = true;
AcademyNewsDetailPage.getLayout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
export default AcademyNewsDetailPage;

import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material/';

import { ArticleType } from 'src/types/apps/articleTypes';
import Translations from 'src/layouts/components/Translations';

interface IProps {
	data: ArticleType;
}

const placeholderImages = [
	'/images/pages/pricing-plans-1.jpg',
	'/images/pages/pricing-plans-2.jpg',
	'/images/pages/pricing-plans-3.jpg'
];

export const AcademyNewsCard: FC<IProps> = ({ data }) => {
	const router = useRouter();
	const preview = data.articleFiles?.find(f => !f?.file.extension?.includes('pdf'));

	const content = data.localeContent as ArticleType[];

	return (
		<Card sx={{ height: '100%' }}>
			<Box sx={{ position: 'relative', height: '12rem' }}>
				{!!preview ? (
					<Image
						style={{ objectFit: 'cover', pointerEvents: 'none' }}
						src={preview.file.path}
						alt={`${data.title}`}
						quality={100}
						fill
					/>
				) : (
					<Image
						style={{ objectFit: 'cover', pointerEvents: 'none' }}
						src={placeholderImages[2]}
						alt={`${data.title}`}
						quality={100}
						fill
					/>
				)}
			</Box>

			<CardContent sx={{ height: 'calc(100% - 12rem)' }}>
				<Box
					sx={{
						height: '100%',
						width: '100%',
						display: 'grid',
						gridTemplateColumns: '1fr',
						gridTemplateRows: 'auto 1fr auto',
						alignContent: 'space-between',
						justifyItems: 'start'
					}}
				>
					<Typography sx={{ mb: 3 }} variant='h6'>
						{content.length > 0 && content[0].title}
					</Typography>

					<Typography
						sx={{
							verticalAlign: 'top',
							mb: 3,
							lineClamp: 3,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							WebkitLineClamp: 3,
							display: '-webkit-box',
							WebkitBoxOrient: 'vertical'
						}}
						variant='subtitle2'
					>
						{content.length > 0 && content[0].text}
					</Typography>
					<Button onClick={() => router.push(`/article/card/${data.id}`)}>
						<Translations text='Detailed' locale='buttons' />
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

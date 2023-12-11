import { FC } from 'react';

import { Box } from '@mui/material';

import { AcademyNewsCard } from 'src/views/ui/swiper-section/card-ui';
import { ArticleType } from 'src/types/apps/articleTypes';

interface Props {
	artices?: ArticleType[];
}

const ArticleContent: FC<Props> = ({ artices }) => {
	return (
		<>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
					gap: { xs: 4, sm: 5 }
				}}
			>
				{artices?.map(data => (
					<AcademyNewsCard key={data.id} data={data} />
				))}
			</Box>
		</>
	);
};

export default ArticleContent;

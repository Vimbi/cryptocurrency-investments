import { FC, useState } from 'react';
import { Box, Typography, Button, ButtonProps, IconButton } from '@mui/material/';
import { styled } from '@mui/material/styles';
import { Direction } from '@mui/material';
import { useRouter } from 'next/router';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Third Party Components
import { useKeenSlider } from 'keen-slider/react';
import { AcademyNewsCard } from './card-ui';
import { ArticleType } from 'src/types/apps/articleTypes';
import Translations from 'src/layouts/components/Translations';

interface IProps {
	title: string;
	extendedPageLink: string;
	data: ArticleType[];
	direction?: Direction;
}

const CustomButton = styled(Button)<ButtonProps>(() => ({
	backgroundColor: '#5CCE81',
	color: '#16642F',
	'&:hover, &:active': {
		backgroundColor: '#5CCE81'
	}
}));

export const SwiperCardsSection: FC<IProps> = ({ title, extendedPageLink, data, direction = 'ltr' }) => {
	const router = useRouter();
	const [loaded, setLoaded] = useState<boolean>(false);
	const [currentSlide, setCurrentSlide] = useState<number>(0);
	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
		vertical: false,
		rtl: direction === 'rtl',
		slides: {
			perView: 1,
			spacing: 8
		},
		slideChanged(slider) {
			setCurrentSlide(slider.track.details.rel);
		},
		created() {
			setLoaded(true);
		},
		breakpoints: {
			'(min-width: 500px)': {
				slides: {
					perView: 2,
					spacing: 20
				}
			},
			'(min-width: 960px)': {
				slides: {
					perView: 3,
					spacing: 20
				}
			},
			'(min-width:1240px)': {
				slides: {
					perView: 4,
					spacing: 20
				}
			}
		}
	});

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
				<Typography fontWeight='bold' variant='h3'>
					{title}
				</Typography>
				{loaded && instanceRef.current && (
					<Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 3 }}>
						<IconButton
							color={currentSlide === 0 ? 'default' : 'primary'}
							disabled={currentSlide === 0}
							onClick={(e: any) => e.stopPropagation() || instanceRef.current?.prev()}
						>
							<Icon icon='mdi:chevron-left' />
						</IconButton>
						<IconButton
							color={currentSlide === instanceRef.current.track.details.maxIdx ? 'default' : 'primary'}
							onClick={(e: any) => e.stopPropagation() || instanceRef.current?.next()}
							disabled={currentSlide === instanceRef.current.track.details.maxIdx}
						>
							<Icon icon='mdi:chevron-right' />
						</IconButton>
					</Box>
				)}
			</Box>
			<Box ref={sliderRef} sx={{ display: 'flex' }}>
				{data.map((slide, index) => (
					<Box key={index} className='keen-slider__slide'>
						<AcademyNewsCard data={slide} />
					</Box>
				))}
			</Box>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					mt: { xs: 5, sm: 8 }
				}}
			>
				<CustomButton onClick={() => router.push(extendedPageLink)} variant='contained'>
					<Translations text='ShowMore' locale='buttons' />
				</CustomButton>
			</Box>
		</Box>
	);
};

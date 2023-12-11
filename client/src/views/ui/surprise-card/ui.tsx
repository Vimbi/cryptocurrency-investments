import Image from 'next/image';
import { Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import { FC, HTMLAttributes } from 'react';
import moment from 'moment';
import { RaffleType } from 'src/types/apps/raffleTypes';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Translations from 'src/layouts/components/Translations';

interface IProps extends HTMLAttributes<HTMLDivElement> {
	data: RaffleType;
}

export const SurpriseCard: FC<IProps> = ({ data, ...props }) => {
	const [ref] = useKeenSlider<HTMLDivElement>({
		mode: 'free',
		rtl: false,
		breakpoints: {
			'(min-width: 0px)': {
				slides: {
					perView: 2,
					spacing: 16
				}
			},
			'(min-width:940px)': {
				slides: {
					perView: 1,
					spacing: 16
				}
			}
		}
	});

	const content = data.localeContent;

	return (
		<Card {...props}>
			<CardContent>
				<Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
					<Box
						sx={{
							transition: 'height .2s ease-in-out',
							width: '100%',
							height: { xs: '20rem', sm: '30rem' },
							overflow: 'hidden',
							borderRadius: 1,
							position: 'relative'
						}}
					>
						{data.files && data.files.length > 0 ? (
							data.files.length > 1 ? (
								<Box ref={ref} className='keen-slider'>
									{data.files.map(image => (
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
												alt={content[0]?.title}
												fill
											/>
										</Box>
									))}
								</Box>
							) : (
								<Image
									style={{ objectFit: 'cover' }}
									src={data.files[0].file.path}
									alt={content[0]?.title}
									fill
								/>
							)
						) : (
							''
						)}
					</Box>
					<Box
						sx={{
							display: 'grid',
							alignItems: 'start',
							flexDirection: '1fr',
							gridGap: { xs: 16, sm: 20, md: 32 }
						}}
					>
						<Typography variant='h4'>{content[0]?.title}</Typography>
						<Divider />
						<Grid container>
							<Grid item xs={12} sm={3} sx={{ mb: 2 }}>
								<Typography color='secondary'>
									<Translations text='DrawDate' locale='common' />:
								</Typography>
							</Grid>
							<Grid item xs={12} sm={9}>
								<Typography>
									{moment(data.startDate).format('DD.MM.YYYY')} -{' '}
									{moment(data.endDate).format('DD.MM.YYYY')}
								</Typography>
							</Grid>
						</Grid>
						<Divider />
						<Grid container>
							<Grid item xs={12} sm={3} sx={{ mb: 2 }}>
								<Typography color='secondary'>
									<Translations text='Conditions' locale='common' />:
								</Typography>
							</Grid>
							<Grid item xs={12} sm={9}>
								<Typography>{content[0]?.description}</Typography>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
};

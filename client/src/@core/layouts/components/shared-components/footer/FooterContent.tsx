// ** Next Import
import Link from 'next/link';
import Image from 'next/image';

// ** MUI Imports
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Translations from 'src/layouts/components/Translations';

// import { Theme } from '@mui/material/styles';
// import useMediaQuery from '@mui/material/useMediaQuery';

const LinkStyled = styled(Link)(({ theme }) => ({
	textDecoration: 'none',
	fontSize: '1rem',
	color: `rgb(${theme.palette.customColors.main})`
}));

const FooterContent = () => {
	// ** Var
	// const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

	return (
		<div className='banner-gap'>
			<Box
				sx={{
					gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
					display: 'grid',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					'& > * ': {
						mb: 8
					}
				}}
			>
				<Box
					sx={{
						width: { xs: '100%', sm: '100%', xl: 'auto' },
						minWidth: 'fit-content',
						display: 'grid',
						gap: 4,
						gridTemplateColumns: { xs: '1fr 2fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }
					}}
				>
					<Typography variant='body1' color='secondary' sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
						<Translations text='Product' locale='footer' />
					</Typography>
					<Box
						sx={{
							minWidth: 'none',
							width: '100%',
							display: 'grid',
							alignContent: 'start',
							gridTemplateColumns: '1fr',
							'& *': {
								mb: { xs: 4, md: 5 }
							}
						}}
					>
						<LinkStyled href='/products'>
							<Translations text='ProductLink1' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/article/academy'>
							<Translations text='ProductLink2' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/article/news'>
							<Translations text='ProductLink3' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/open-an-office'>
							<Translations text='ProductLink4' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/referral-levels'>
							<Translations text='ProductLink5' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/surprise'>
							<Translations text='ProductLink6' locale='footer' />
						</LinkStyled>
					</Box>
				</Box>
				<Box
					sx={{
						width: { xs: '100%', sm: '100%', xl: 'auto' },
						minWidth: 'fit-content',
						display: 'grid',
						gap: 4,
						gridTemplateColumns: { xs: '1fr 2fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }
					}}
				>
					<Typography variant='body1' color='secondary' sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
						<Translations text='About' locale='footer' />
					</Typography>
					<Box
						sx={{
							minWidth: 'none',
							width: '100%',
							display: 'grid',
							alignContent: 'start',
							gridTemplateColumns: '1fr',
							'& *': {
								mb: { xs: 4, md: 5 }
							}
						}}
					>
						<LinkStyled href='/contacts'>
							<Translations text='AboutLink1' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/faq#support'>
							<Translations text='AboutLink2' locale='footer' />
						</LinkStyled>
						<LinkStyled href='/faq'>
							<Translations text='AboutLink3' locale='footer' />
						</LinkStyled>
					</Box>
				</Box>
				<Box
					sx={{
						width: { xs: '100%', sm: '100%', xl: 'auto' },
						minWidth: 'fit-content',
						display: 'grid',
						gap: 2,
						gridTemplateColumns: { xs: '1fr 2fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }
					}}
				>
					<Typography variant='body1' color='secondary' sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
						<Translations text='Socials' locale='footer' />
					</Typography>
					<Box
						sx={{
							minWidth: 'none',
							width: '100%',
							display: 'grid',
							alignContent: 'start',
							gridTemplateColumns: '1fr',
							'& *': {
								mb: { xs: 4, md: 5 }
							}
						}}
					>
						<LinkStyled href='https://youtube.com/@Nephritetraderu?si=gLXn_APyhciwbmxc' target='blank'>
							Youtube
						</LinkStyled>
						<LinkStyled href='https://x.com/nephritetrade?s=21' target='blank'>
							Twitter
						</LinkStyled>
						<LinkStyled href='https://instagram.com/nephrite_trade?igshid=OGQ5ZDc2ODk2ZA==' target='blank'>
							Instagram
						</LinkStyled>
						<LinkStyled href='https://t.me/nephritetraderus' target='blank'>
							Telegram
						</LinkStyled>
					</Box>
				</Box>
			</Box>
			<Divider sx={{ my: { xs: 8, md: 11 } }} />
			<Box>
				<Box
					sx={{
						display: 'grid',
						alignItems: 'start',
						gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
						justifyContent: 'space-between',
						rowGap: { xs: 4 },
						'& > * ': { mb: { xs: 4, mmd: 0 } }
					}}
				>
					<Image
						style={{ marginBottom: '1rem' }}
						src='/images/NEPHRITTRADE.svg'
						alt='NEPHRITTRADE'
						width={180}
						height={16}
					/>
					<LinkStyled sx={{ width: '100%' }} href=''>
						<Translations text='LegalNotice' locale='footer' />
					</LinkStyled>
					<LinkStyled
						sx={{
							width: '100%',
							gridColumnStart: { xs: 1, sm: 2, md: 3 }
						}}
						href=''
					>
						<Translations text='UserAgreement' locale='footer' />
					</LinkStyled>
					<Typography color='secondary' sx={{ gridRowStart: { xs: 4, sm: 2, md: 3 } }}>
						<Translations text='Copyright' locale='footer' />
					</Typography>
				</Box>
			</Box>
			{/* <Divider sx={{ my: { xs: 8, md: 11 } }} /> */}
			{/* <Box sx={{ mb: 12 }}>
				<LinkStyled
					href='https://ovva.ru/'
					target='blank'
					sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}
				>
					<Translations text='DevelopedBy' locale='footer' />
					<Image src='/images/ovva.svg' alt='' width={100} height={25} style={{ marginLeft: 8 }} />
				</LinkStyled>
			</Box> */}
		</div>

		// <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
		// 	<Typography sx={{ mr: 2 }}>
		// 		{`© ${new Date().getFullYear()}, Made with `}
		// 		<Box component='span' sx={{ color: 'error.main' }}>
		// 			❤️
		// 		</Box>
		// 		{` by `}
		// 		<LinkStyled target='_blank' href='https://ovva.ru/'>
		// 			Ovva
		// 		</LinkStyled>
		// 	</Typography>
		// 	{hidden ? null : (
		// 		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
		// 			<LinkStyled target='_blank' href='https://mui.com/store/license/'>
		// 				License
		// 			</LinkStyled>
		// 			<LinkStyled target='_blank' href='https://mui.com/store/contributors/themeselection/'>
		// 				More Themes
		// 			</LinkStyled>
		// 			<LinkStyled
		// 				target='_blank'
		// 				href='https://demos.themeselection.com/marketplace/materio-mui-react-nextjs-admin-template/documentation'
		// 			>
		// 				Documentation
		// 			</LinkStyled>
		// 			<LinkStyled target='_blank' href='https://themeselection.com/support/'>
		// 				Support
		// 			</LinkStyled>
		// 		</Box>
		// 	)}
		// </Box>
	);
};

export default FooterContent;

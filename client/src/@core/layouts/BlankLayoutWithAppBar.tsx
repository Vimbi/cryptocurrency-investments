// ** MUI Imports
import Fab from '@mui/material/Fab';
import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import MuiToolbar, { ToolbarProps } from '@mui/material/Toolbar';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Theme Config Import
import themeConfig from 'src/configs/themeConfig';

// ** Type Import
import { GuestLayoutProps } from 'src/@core/layouts/types';

// ** Components
import Customizer from 'src/@core/components/customizer';
import Footer from './components/shared-components/footer';
import NavigationDrawer from './components/blank-layout-with-appBar/navigation';
import ScrollToTop from 'src/@core/components/scroll-to-top';
import AppBarContent from './components/blank-layout-with-appBar/app-bar-content';

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba';
import { useState } from 'react';

const BlankLayoutWrapper = styled('div')({
	height: '100%',
	display: 'flex',
	...(themeConfig.horizontalMenuAnimation && { overflow: 'clip' })
});

const MainContentWrapper = styled(Box)<BoxProps>({
	flexGrow: 1,
	minWidth: 0,
	display: 'flex',
	minHeight: '100vh',
	flexDirection: 'column'
});

const Toolbar = styled(MuiToolbar)<ToolbarProps>(({ theme }) => ({
	width: '100%',
	padding: `${theme.spacing(0, 6)} !important`,
	[theme.breakpoints.down('sm')]: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(4)
	},
	[theme.breakpoints.down('xs')]: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2)
	}
}));

const ContentWrapper = styled('main')(({ theme }) => ({
	flexGrow: 1,
	width: '100%',
	padding: theme.spacing(6),
	transition: 'padding .25s ease-in-out',
	[theme.breakpoints.down('sm')]: {
		paddingLeft: theme.spacing(4),
		paddingRight: theme.spacing(4)
	}
}));

const BlankLayoutWithAppBar = (props: GuestLayoutProps) => {
	// ** Props
	const { hidden, children, settings, scrollToTop, footerProps, saveSettings, contentHeightFixed, layoutProps } =
		props;

	// ** Vars
	const { skin, appBar, navHidden, appBarBlur, contentWidth } = settings;
	const appBarProps = layoutProps?.appBar?.componentProps;

	let userAppBarStyle = {};
	if (appBarProps && appBarProps.sx) {
		userAppBarStyle = appBarProps.sx;
	}

	const userAppBarProps = Object.assign({}, appBarProps);
	delete userAppBarProps.sx;

	const { collapsedNavigationSize } = themeConfig;

	const navigationBorderWidth = skin === 'bordered' ? 1 : 0;
	const collapsedNavWidth = collapsedNavigationSize;

	const [navVisible, setNavVisible] = useState<boolean>(false);

	const toggleNavVisibility = () => setNavVisible(!navVisible);

	return (
		<BlankLayoutWrapper className='layout-wrapper'>
			<MainContentWrapper
				className='layout-content-wrapper'
				sx={{ ...(contentHeightFixed && { maxHeight: '100vh' }) }}
			>
				{/* Navbar (or AppBar) and Navigation Menu Wrapper */}
				<AppBar
					color='default'
					elevation={skin === 'bordered' ? 0 : 3}
					className='layout-navbar-and-nav-container'
					position={'sticky'}
					sx={{
						zIndex: '1201',
						alignItems: 'center',
						color: 'text.primary',
						justifyContent: 'center',
						backgroundColor: 'background.paper',
						...(appBar === 'static' && { zIndex: 13 }),
						...(skin === 'bordered' && { borderBottom: theme => `1px solid ${theme.palette.divider}` }),
						transition:
							'border-bottom 0.2s ease-in-out, backdrop-filter .25s ease-in-out, box-shadow .25s ease-in-out',
						...(appBar === 'fixed'
							? appBarBlur && {
									backdropFilter: 'blur(8px)',
									backgroundColor: theme => hexToRGBA(theme.palette.background.paper, 0.85)
							  }
							: {}),
						...userAppBarStyle
					}}
					{...userAppBarProps}
				>
					{/* Navbar / AppBar */}
					<Box
						className='layout-navbar'
						sx={{
							width: '100%',
							...(navHidden ? {} : { borderBottom: theme => `1px solid ${theme.palette.divider}` })
						}}
					>
						<Toolbar
							className='navbar-content-container'
							sx={{
								mx: 'auto',
								...(contentWidth === 'boxed' && { '@media (min-width:1440px)': { maxWidth: 1440 } }),
								minHeight: theme => `${(theme.mixins.toolbar.minHeight as number) - 1}px !important`
							}}
						>
							<AppBarContent
								{...props}
								hidden={hidden}
								settings={settings}
								saveSettings={saveSettings}
								appBarContent={layoutProps?.appBar?.content}
								navItems={layoutProps?.appBar?.navItems}
								navVisible={!!navVisible}
								toggleNavVisibility={toggleNavVisibility}
							/>
						</Toolbar>
					</Box>

					{/* Navigation Menu */}
					{/* {hidden || !navVisible ? null : (
						<Box
							className='layout-horizontal-nav'
							sx={{
								width: '100%',
								...layoutProps?.navMenu?.sx
							}}
						>
							<Toolbar
								className='horizontal-nav-content-container'
								sx={{
									mx: 'auto',
									...(contentWidth === 'boxed' && {
										'@media (min-width:1440px)': { maxWidth: 1440 }
									}),
									minHeight: theme =>
										`${
											(theme.mixins.toolbar.minHeight as number) - (skin === 'bordered' ? 1 : 0)
										}px !important`
								}}
							>
								{(userNavMenuContent && userNavMenuContent(props)) || (
									<Navigation
										{...props}
										navItems={
											(layoutProps as NonNullable<GuestLayoutProps['layoutProps']>).appBar
												?.subNavItems
										}
									/>
								)}
							</Toolbar>
						</Box>
					)} */}
				</AppBar>

				{/* Content */}
				<ContentWrapper
					className='layout-page-content'
					sx={{
						...(contentHeightFixed && { display: 'flex', overflow: 'hidden' }),
						...(contentWidth === 'boxed' && {
							mx: 'auto',
							'@media (min-width:1440px)': { maxWidth: 1440 },
							'@media (min-width:1200px)': { maxWidth: '100%' }
						}),

						// pt: theme => `${(theme.mixins.toolbar.minHeight as number) + 10}px !important`,
						minHeight: theme => `calc(100dvh - ${theme.mixins.toolbar.minHeight as number}px) !important`
					}}
				>
					{children}
				</ContentWrapper>

				{/* Footer */}
				<Footer {...props} footerStyles={footerProps?.sx} footerContent={footerProps?.content} />

				{/* Customizer */}
				{themeConfig.disableCustomizer || hidden ? null : <Customizer />}

				{/* Scroll to top button */}
				{scrollToTop ? (
					scrollToTop(props)
				) : (
					<ScrollToTop className='mui-fixed'>
						<Fab color='primary' size='small' aria-label='scroll back to top'>
							<Icon icon='mdi:arrow-up' />
						</Fab>
					</ScrollToTop>
				)}
			</MainContentWrapper>

			{/* Navigation Drawer for Mobile */}
			<NavigationDrawer
				{...props}
				navItems={hidden ? layoutProps.navMenu?.navItems : layoutProps.appBar?.subNavItems}
				navWidth={'100%'}
				navVisible={navVisible}
				setNavVisible={setNavVisible}
				collapsedNavWidth={collapsedNavWidth}
				toggleNavVisibility={toggleNavVisibility}
				navigationBorderWidth={navigationBorderWidth}
				afterNavMenuContent={layoutProps.navMenu?.afterContent}
				beforeNavMenuContent={layoutProps.navMenu?.beforeContent}
			/>
			{/* )} */}
		</BlankLayoutWrapper>
	);
};

export default BlankLayoutWithAppBar;

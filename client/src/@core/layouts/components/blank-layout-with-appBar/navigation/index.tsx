// ** React Import
import { ReactNode, useRef, useState } from 'react';

// ** MUI Imports
import List from '@mui/material/List';
import Box, { BoxProps } from '@mui/material/Box';
import { createTheme, responsiveFontSizes, styled, ThemeProvider } from '@mui/material/styles';

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar';

// ** Type Import
import { GuestLayoutProps, NavLink } from 'src/@core/layouts/types';

// ** Theme Config
import themeConfig from 'src/configs/themeConfig';

// ** Component Imports
import Drawer from './Drawer';
import BlankNavItems from './BlankNavItems';

// ** Theme Options
import themeOptions from 'src/@core/theme/ThemeOptions';

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba';

interface Props {
	navWidth: number | string;
	navVisible: boolean;
	collapsedNavWidth: number;
	hidden: GuestLayoutProps['hidden'];
	navigationBorderWidth: number;
	toggleNavVisibility: () => void;
	settings: GuestLayoutProps['settings'];
	children: GuestLayoutProps['children'];
	setNavVisible: (value: boolean) => void;
	saveSettings: GuestLayoutProps['saveSettings'];
	navItems?: NavLink[];
	afterNavMenuContent?: (props?: any) => ReactNode;
	beforeNavMenuContent?: (props?: any) => ReactNode;
}

const StyledBoxForShadow = styled(Box)<BoxProps>(({ theme }) => ({
	top: 60,
	left: -8,
	zIndex: 2,
	opacity: 0,
	position: 'absolute',
	pointerEvents: 'none',
	width: 'calc(100% + 15px)',
	height: theme.mixins.toolbar.minHeight,
	transition: 'opacity .15s ease-in-out',
	background: `linear-gradient(${theme.palette.background.default} ${
		theme.direction === 'rtl' ? '95%' : '5%'
	},${hexToRGBA(theme.palette.background.default, 0.85)} 30%,${hexToRGBA(
		theme.palette.background.default,
		0.5
	)} 65%,${hexToRGBA(theme.palette.background.default, 0.3)} 75%,transparent)`,
	'&.scrolled': {
		opacity: 1
	}
}));

const Navigation = (props: Props) => {
	// ** Props
	const { hidden, settings, afterNavMenuContent, beforeNavMenuContent } = props;

	// ** States
	const [navHover, setNavHover] = useState<boolean>(false);

	// ** Ref
	const shadowRef = useRef(null);

	// ** Var
	const { navCollapsed } = settings;
	const { beforeVerticalNavMenuContentPosition, afterVerticalNavMenuContentPosition } = themeConfig;

	// ** Create new theme for the navigation menu when mode is `semi-dark`
	let darkTheme = createTheme(themeOptions(settings, 'dark'));

	// ** Set responsive font sizes to true
	if (themeConfig.responsiveFontSizes) {
		darkTheme = responsiveFontSizes(darkTheme);
	}

	// ** Fixes Navigation InfiniteScroll
	const handleInfiniteScroll = (ref: HTMLElement) => {
		if (ref) {
			// @ts-ignore
			ref._getBoundingClientRect = ref.getBoundingClientRect;

			ref.getBoundingClientRect = () => {
				// @ts-ignore
				const original = ref._getBoundingClientRect();

				return { ...original, height: Math.floor(original.height) };
			};
		}
	};

	// ** Scroll Menu
	const scrollMenu = (container: any) => {
		if (beforeVerticalNavMenuContentPosition === 'static') {
			container = hidden ? container.target : container;
			if (shadowRef && container.scrollTop > 0) {
				// @ts-ignore
				if (!shadowRef.current.classList.contains('scrolled')) {
					// @ts-ignore
					shadowRef.current.classList.add('scrolled');
				}
			} else {
				// @ts-ignore
				shadowRef.current.classList.remove('scrolled');
			}
		}
	};

	const ScrollWrapper = hidden ? Box : PerfectScrollbar;

	return (
		<ThemeProvider theme={darkTheme}>
			<Drawer {...props} navHover={navHover} setNavHover={setNavHover}>
				{beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
					? beforeNavMenuContent()
					: null}
				{beforeVerticalNavMenuContentPosition === 'static' && <StyledBoxForShadow ref={shadowRef} />}
				<Box sx={{ position: 'relative', overflow: 'hidden' }}>
					{/* @ts-ignore */}
					<ScrollWrapper
						{...(hidden
							? {
									onScroll: (container: any) => scrollMenu(container),
									sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
							  }
							: {
									options: { wheelPropagation: false },
									onScrollY: (container: any) => scrollMenu(container),
									containerRef: (ref: any) => handleInfiniteScroll(ref)
							  })}
					>
						{/* {hidden && (
							<Box
								sx={{
									m: '1rem auto 0',
									p: '0 1.5rem',
									maxWidth: 1440,
									width: '100%',
									display: 'flex',
									justifyContent: 'flex-end',
									'& > *': {
										ml: 2
									}
								}}
							></Box>
						)} */}
						<List
							className='nav-items'
							{...(hidden
								? {
										sx: {
											pt: 0,
											transition: 'padding .25s ease',
											'& > :first-child': { mt: '0' },
											pr: !navCollapsed || (navCollapsed && navHover) ? 4.5 : 1.25,
											pl: 2
										}
								  }
								: {
										sx: {
											pt: 0,
											transition: 'padding .25s ease',
											'& > :first-child': { mt: '0' },
											pr: !navCollapsed || (navCollapsed && navHover) ? 4.5 : 1.25,
											pl: 2,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-around',
											maxWidth: '1200px',
											margin: '0 auto'
										}
								  })}
						>
							<BlankNavItems {...props} hasParent={hidden} />
						</List>
						{afterNavMenuContent && hidden && afterVerticalNavMenuContentPosition === 'static'
							? afterNavMenuContent()
							: null}
					</ScrollWrapper>
					{afterNavMenuContent && hidden && afterVerticalNavMenuContentPosition === 'fixed'
						? afterNavMenuContent()
						: null}
				</Box>
			</Drawer>
		</ThemeProvider>
	);
};

export default Navigation;

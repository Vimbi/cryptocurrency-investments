import { FC, ReactNode } from 'react';

import { useMediaQuery } from '@mui/material';
import { useSettings } from 'src/@core/hooks/useSettings';

import BlankLayoutWithAppBar from 'src/@core/layouts/BlankLayoutWithAppBar';
import VerticalAppBarContent from 'src/layouts/components/blank/AppBarContent';
import NavItems, { SubNavigation } from 'src/navigation/blank';

import { Theme } from '@mui/material/styles';
import BlankVerticalNavigation from 'src/navigation/blank/vertical';
import AfterNavigationContent from './components/blank/AfterNavigationContent';

interface Props {
	children: ReactNode;
	contentHeightFixed?: boolean;
}

const GuestLayout: FC<Props> = props => {
	// const [hidden, setHidden] = useState(true);
	const { children, contentHeightFixed } = props;

	const { settings, saveSettings } = useSettings();
	const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down(1240), { defaultMatches: true });

	return (
		<BlankLayoutWithAppBar
			hidden={hidden}
			settings={settings}
			saveSettings={saveSettings}
			contentHeightFixed={contentHeightFixed}
			layoutProps={{
				appBar: {
					navItems: NavItems(),
					subNavItems: SubNavigation(),
					content: props => (
						<VerticalAppBarContent
							hidden={hidden}
							settings={settings}
							saveSettings={saveSettings}
							toggleNavVisibility={props.toggleNavVisibility}
							navVisible={props.navVisible}
						/>
					)
				},
				navMenu: {
					navItems: BlankVerticalNavigation(),
					afterContent: props => (
						<AfterNavigationContent settings={settings} saveSettings={saveSettings} {...props} />
					)
				}
			}}
		>
			{children}
		</BlankLayoutWithAppBar>
	);
};

export default GuestLayout;

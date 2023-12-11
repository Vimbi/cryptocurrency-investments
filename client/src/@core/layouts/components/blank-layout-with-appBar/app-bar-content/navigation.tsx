// ** MUI Imports
import Box from '@mui/material/Box';

// ** Type Import
import { GuestLayoutProps } from 'src/@core/layouts/types';

// ** Config Import
import themeConfig from 'src/configs/themeConfig';

// ** Menu Components
import BlankNavItems from '../navigation/BlankNavItems';

// ** Types
interface Props {
	settings: GuestLayoutProps['settings'];
	navItems: NonNullable<NonNullable<GuestLayoutProps['layoutProps']>['navMenu']>['navItems'];
}

const Navigation = (props: Props) => {
	return (
		<Box
			className='menu-content'
			sx={{
				width: '100%',
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'center',
				'& > *': {
					'&:not(:last-child)': { mr: 2 },
					...(themeConfig.menuTextTruncate && { maxWidth: 220 })
				}
			}}
		>
			<BlankNavItems {...props} />
		</Box>
	);
};

export default Navigation;

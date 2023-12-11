import { FC, SyntheticEvent } from 'react';

import { Tab } from '@mui/material';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';

import { styled } from '@mui/material/styles';

import { ArticleTypeType } from 'src/types/apps/articleTypes';
import { useSettings } from 'src/@core/hooks/useSettings';
import Translations from 'src/layouts/components/Translations';

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
	'& .MuiTabs-indicator': {
		display: 'none'
	},
	'& .Mui-selected': {
		backgroundColor: theme.palette.primary.main,
		color: `${theme.palette.primary.contrastText} !important`
	},
	'& .MuiTab-root': {
		minHeight: 42,
		minWidth: 114,
		borderRadius: '9999px'
	}
}));

interface Props {
	onChange: (event: SyntheticEvent, newValue: string) => void;
	typeTabs?: ArticleTypeType[];
}

const ArticleTabs: FC<Props> = ({ onChange, typeTabs }) => {
	const {
		settings: { localeId }
	} = useSettings();

	const localeTabs = typeTabs?.map(type => ({
		...type,
		localeContent: type.localeContent?.find(locale => locale.localeId === localeId)
	}));

	return (
		<TabList sx={{ mt: 8, mb: { xs: 4, md: 6 } }} onChange={onChange}>
			<Tab value='all' label={<Translations text='all' locale='labels' />} />
			{localeTabs?.map(tab => (
				<Tab value={tab.name} key={tab.name} label={tab.localeContent?.displayName} />
			))}
		</TabList>
	);
};

export default ArticleTabs;

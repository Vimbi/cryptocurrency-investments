// ** React Imports
import { FC, SyntheticEvent } from 'react';

// ** MUI Imports
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import { styled } from '@mui/material/styles';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

// Styled TabList component
const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
	'& .MuiTabs-indicator': {
		display: 'none'
	},
	'& .Mui-selected': {
		backgroundColor: theme.palette.primary.main,
		color: `${theme.palette.primary.contrastText} !important`
	},
	'& .MuiTab-root': {
		minHeight: 38,
		minWidth: 130,
		borderRadius: theme.shape.borderRadius,
		color: `rgb(${theme.palette.customColors.main})`
	}
}));

type TabsCurrenciesProps = {
	activeCurrency?: string;
	setActiveCurrency?: (currency: string) => void;
};

const TabsCurrencies: FC<TabsCurrenciesProps> = ({ activeCurrency, setActiveCurrency }) => {
	// ** State
	const currencies = useSelector((state: RootState) => state.currencies.data);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		if (typeof setActiveCurrency !== 'undefined') setActiveCurrency(newValue);
	};

	return (
		<TabContext value={activeCurrency || ''}>
			<TabList
				variant='scrollable'
				scrollButtons='auto'
				onChange={handleChange}
				aria-label='customized tabs example'
			>
				{currencies &&
					currencies?.map(item => {
						return <Tab value={item.id} label={item.displayName} key={item.id} />;
					})}
			</TabList>
		</TabContext>
	);
};

export default TabsCurrencies;

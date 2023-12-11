// ** React Imports
import { FC, SyntheticEvent } from 'react';

// ** MUI Imports
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import { styled } from '@mui/material/styles';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { NetworkType } from 'src/types/apps/networkType';

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

type TabsNetworksProps = {
  activeNetwork?: NetworkType;
  setActiveNetwork?: (network: NetworkType) => void;
};

const TabsNetworks: FC<TabsNetworksProps> = ({ activeNetwork, setActiveNetwork }) => {
  // ** State
  const networks = useSelector((state: RootState) => state.networks.data);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    const newNetwork = networks.find((net: NetworkType) => net.id === (newValue as string));
    console.log(newNetwork);

    if (typeof setActiveNetwork !== 'undefined') setActiveNetwork(newNetwork);
  };

  return (
    <TabContext value={activeNetwork?.id || ''}>
      <TabList
        variant='scrollable'
        scrollButtons='auto'
        onChange={handleChange}
        aria-label='customized tabs example'
      >
        {networks &&
          networks?.map((item: NetworkType) => {
            return <Tab value={item.id} label={item.displayName} key={item.id} />;
          })}
      </TabList>
    </TabContext>
  );
};

export default TabsNetworks;

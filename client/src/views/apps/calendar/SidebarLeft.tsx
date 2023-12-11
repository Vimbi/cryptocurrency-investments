// ** MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// ** Types
import { CalendarColors, CalendarSideBarItems } from 'src/types/apps/calendarTypes';
import { ProductItemWithEarnings } from 'src/store/apps/earnings/types';
import Translations from 'src/layouts/components/Translations';

type SidebarLeftType = {
	mdAbove: boolean;
	onViewAll: (value: boolean) => void;
	viewAllChecked: boolean;
	leftSidebarWidth: number;
	leftSidebarOpen: boolean;
	calendarsColor: CalendarColors;
	items: CalendarSideBarItems[];
	handleLeftSidebarToggle: () => void;
	handleAddEventSidebarToggle: () => void;
	handleSelectEvent: (event: Record<string, any>) => void;
	handleOnChecked: (product: ProductItemWithEarnings, value: boolean) => void;
};

const SidebarLeft = (props: SidebarLeftType) => {
	const {
		mdAbove,
		onViewAll,
		viewAllChecked,
		calendarsColor,
		items,
		leftSidebarOpen,
		leftSidebarWidth,
		handleSelectEvent,
		handleOnChecked,
		handleLeftSidebarToggle,
		handleAddEventSidebarToggle
	} = props;

	const renderFilters = items.length
		? items.map((item, index) => {
				const color = calendarsColor[item.id] || 'primary';

				return (
					<FormControlLabel
						key={index}
						label={item.value}
						control={
							<Checkbox
								color={color}
								checked={item.checked}
								onClick={() => handleOnChecked({ id: item.id, name: item.value }, item.checked)}
							/>
						}
					/>
				);
		  })
		: null;

	const handleSidebarToggleSidebar = () => {
		handleAddEventSidebarToggle();
		handleSelectEvent({});
	};

	if (renderFilters) {
		return (
			<Drawer
				open={leftSidebarOpen}
				onClose={handleLeftSidebarToggle}
				variant={mdAbove ? 'permanent' : 'temporary'}
				ModalProps={{
					disablePortal: true,
					disableAutoFocus: true,
					disableScrollLock: true,
					keepMounted: true // Better open performance on mobile.
				}}
				sx={{
					zIndex: 2,
					display: 'block',
					position: mdAbove ? 'static' : 'absolute',
					'& .MuiDrawer-paper': {
						borderRadius: 1,
						boxShadow: 'none',
						width: leftSidebarWidth,
						borderTopRightRadius: 0,
						alignItems: 'flex-start',
						borderBottomRightRadius: 0,
						p: theme => theme.spacing(5),
						zIndex: mdAbove ? 2 : 'drawer',
						position: mdAbove ? 'static' : 'absolute'
					},
					'& .MuiBackdrop-root': {
						borderRadius: 1,
						position: 'absolute'
					}
				}}
			>
				<Button fullWidth variant='contained' onClick={handleSidebarToggleSidebar}>
					<Translations text='earnings.addPercent' locale='labels' />
				</Button>

				<Typography variant='caption' sx={{ mt: 7, mb: 2, textTransform: 'uppercase' }}>
					<Translations text='Rates' locale='navigation' />
				</Typography>
				<FormControlLabel
					label={<Translations text='all' locale='labels' />}
					control={
						<Checkbox
							color='secondary'
							checked={viewAllChecked}
							onChange={e => onViewAll(e.target.checked)}
						/>
					}
				/>
				{renderFilters}
			</Drawer>
		);
	} else {
		return null;
	}
};

export default SidebarLeft;

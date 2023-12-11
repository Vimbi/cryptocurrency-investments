// ** MUI Imports
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

// ** Third Party Imports

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Styled Components

// ** Types
import { AddEventSidebarType } from 'src/types/apps/calendarTypes';

const AddEventSidebar = (props: AddEventSidebarType) => {
	// ** Props
	const { drawerWidth, addEventSidebarOpen, handleAddEventSidebarToggle, children } = props;

	const handleSidebarClose = async () => {
		handleAddEventSidebarToggle();
	};

	// const resetToStoredValues = useCallback(() => {
	// 	if (store.selectedEvent !== null) {
	// 		const event = store.selectedEvent;
	// 		setValue('title', event.title || '');
	// 		setValues({
	// 			url: event.url || '',
	// 			title: event.title || '',
	// 			allDay: event.allDay,
	// 			guests: event.extendedProps.guests || [],
	// 			description: event.extendedProps.description || '',
	// 			calendar: event.extendedProps.calendar || 'Business',
	// 			endDate: event.end !== null ? event.end : event.start,
	// 			startDate: event.start !== null ? event.start : new Date()
	// 		});
	// 	}
	// }, [setValue, store.selectedEvent]);

	// const resetToEmptyValues = useCallback(() => {
	// 	setValue('title', '');
	// 	setValues(defaultState);
	// }, [setValue]);

	// useEffect(() => {
	// 	if (store.selectedEvent !== null) {
	// 		resetToStoredValues();
	// 	} else {
	// 		resetToEmptyValues();
	// 	}
	// }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent]);

	return (
		<Drawer
			anchor='right'
			open={addEventSidebarOpen}
			onClose={handleSidebarClose}
			ModalProps={{ keepMounted: true }}
			sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
		>
			<Box
				className='sidebar-header'
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					backgroundColor: 'background.default',
					p: theme => theme.spacing(3, 3.255, 3, 5.255)
				}}
			>
				<Typography variant='h6'>{props.title}</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
						<Icon icon='mdi:close' fontSize={20} />
					</IconButton>
				</Box>
			</Box>
			<Box className='sidebar-body' sx={{ p: theme => theme.spacing(5, 6) }}>
				{children}
			</Box>
		</Drawer>
	);
};

export default AddEventSidebar;

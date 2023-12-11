// ** React Import
import { useEffect, useRef } from 'react';

// ** Mui
import { Box } from '@mui/material';

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import interactionPlugin from '@fullcalendar/interaction';

// ** Types
import { CalendarType } from 'src/types/apps/calendarTypes';
import { CalendarOptions } from '@fullcalendar/core';

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTranslation } from 'next-i18next';

const Calendar = (props: CalendarType) => {
	// ** Props
	const {
		events,
		direction,
		calendarApi,
		calendarsColor,
		handleUpdateDates,
		setCalendarApi,
		handleSelectEvent,
		handleLeftSidebarToggle
	} = props;
	const { i18n } = useTranslation();

	// ** Refs
	const calendarRef = useRef<FullCalendar>();

	useEffect(() => {
		if (calendarApi === null) {
			// @ts-ignore
			setCalendarApi(calendarRef.current?.getApi());
		}
	}, [calendarApi, setCalendarApi]);

	// ** calendarOptions(Props)
	const calendarOptions: CalendarOptions = {
		plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, bootstrap5Plugin],
		initialView: 'dayGridMonth',
		headerToolbar: {
			start: 'sidebarToggle, prev, title, next',
			end: 'dayGridMonth'
		},
		views: {
			week: {
				titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
			}
		},
		locale: i18n.language,
		editable: false,
		dragScroll: false,
		dayMaxEvents: 3,
		navLinks: false,
		eventClassNames({ event: calendarEvent }: any) {
			// @ts-ignore
			const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar];

			return [
				// Background Color
				`bg-${colorName}`
			];
		},

		eventClick({ event }: any) {
			const percent = event._def.title;
			const date = event.start;
			const productId = event.extendedProps.calendar;
			handleSelectEvent({ date, percent, productId });

			// handleAddEventSidebarToggle();
			// * Only grab required field otherwise it goes in infinity loop
			// ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
			// event.value = grabEventDataFromEventApi(clickedEvent)
			// isAddNewEventSidebarActive.value = true
		},

		customButtons: {
			sidebarToggle: {
				icon: 'bi bi-list',
				click() {
					handleLeftSidebarToggle();
				}
			}
		},

		dateClick(info: any) {
			// @ts-ignore
			handleSelectEvent({ date: info.date });

			// handleAddEventSidebarToggle();
		},
		direction
	};

	// @ts-ignore
	return (
		<Box>
			<FullCalendar
				events={events as any}
				firstDay={1}
				datesSet={event => handleUpdateDates(event)}
				{...calendarOptions}
			/>
		</Box>
	);
};

export default Calendar;

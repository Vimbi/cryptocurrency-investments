// ** Types
import { CalendarApi, DatesSetArg } from '@fullcalendar/core';
import { ReactNode } from 'react';

// ** Theme Type Import
import { ThemeColor } from 'src/@core/layouts/types';

export type CalendarFiltersType = 'Personal' | 'Business' | 'Family' | 'Holiday' | 'ETC';

export type EventDateType = Date | null | undefined;

export type CalendarColors = { [x: string]: ThemeColor };

export type CalendarSideBarItems = {
	value: string;
	id: string;
	checked: boolean;
};

export type EventType = {
	id: number;
	title: string;
	allDay: boolean;
	end: Date | string | null;
	start: Date | string;
	extendedProps?: {
		location?: string;
		calendar?: string;
		description?: string;
		guests?: string[] | string | undefined;
	};
};

export type AddEventType = {
	url: string;
	title: string;
	display: string;
	allDay: boolean;
	end: Date | string;
	start: Date | string;
	extendedProps: {
		calendar: string;
		description: string | undefined;
		guests: string[] | string | undefined;
	};
};

export type EventStateType = {
	url: string;
	title: string;
	allDay: boolean;
	guests: string[];
	description: string;
	endDate: Date | string;
	startDate: Date | string;
	calendar: CalendarFiltersType | string;
};

export type CalendarStoreType = {
	events: EventType[];
	selectedEvent: null | EventType;
	selectedCalendars: CalendarFiltersType[] | string[];
};

export type CalendarType = {
	events: EventType[];
	calendarApi: CalendarApi | null;
	direction: 'ltr' | 'rtl';
	calendarsColor: CalendarColors;
	handleUpdateDates: (event: DatesSetArg) => void;
	setCalendarApi: (val: CalendarApi) => void;
	handleLeftSidebarToggle: () => void;
	handleAddEventSidebarToggle: () => void;
	handleSelectEvent: (event: Record<string, any>) => void;
};

export type AddEventSidebarType = {
	title: string;
	drawerWidth: number;
	addEventSidebarOpen: boolean;
	handleAddEventSidebarToggle: () => void;
	children?: ReactNode;
};

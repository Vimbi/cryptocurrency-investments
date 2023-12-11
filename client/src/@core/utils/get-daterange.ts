import { format, differenceInDays, addDays } from 'date-fns';

export const getDateRange = (startDate: Date, endDate: Date) => {
	const days = differenceInDays(endDate, startDate);

	return Array.from({ length: days + 1 }, (_, i) => format(addDays(startDate, i), 'MM/dd/yyyy'));
};

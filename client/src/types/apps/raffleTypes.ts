import { DateType } from 'src/types/forms/reactDatepickerTypes';

export type RaffleType = {
	id?: string;
	raffleId?: string;
	title?: string;
	description?: string;
	startDate: DateType | string;
	endDate: DateType | string;
	isPublished: boolean;
	createdAt?: string;
	updatedAt?: null | string;
	files?:
		| {
				raffleId: string;
				fileId: string;
				createdAt: string;
				file: RaffleFileType;
				theme?: string;
		  }[];
	localeId?: string;
	theme?: string;
	localeContent?: any;
};

export type RaffleFileType = {
	createdAt: string;
	id: string;
	path: string;
	name: string;
	extension: string;
	key: string;
};

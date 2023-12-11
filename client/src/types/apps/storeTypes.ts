import { ThemeColor } from 'src/@core/layouts/types';

export type StoresType = {
	id: string;
	name: string;
	tin: null | string;
	email: string;
	website: string;
	description: string;
	phone: string;
	telegramChannel: string;
	whatsapp: string;
	rating: number;
	announcementCounter: number;
	reviewCounter: number;
	isBanned: null | boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: null | string;
	logo: null | string;
	avatarColor?: ThemeColor;
};

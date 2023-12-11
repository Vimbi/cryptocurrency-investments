import { ThemeColor } from 'src/@core/layouts/types';

export type ManufacturerType = {
	id?: string;
	name?: string;
	email?: string;
	website?: string;
	description?: string;
	phone?: string;
	telegramChannel?: string;
	whatsapp?: string;
	rating?: number;
	questionCounter?: number;
	reviewCounter?: number;
	createdAt?: string;
	updatedAt?: null | string;
	deletedAt?: null | string;
	photo?: string | null | string[];
	avatarColor?: ThemeColor;
};

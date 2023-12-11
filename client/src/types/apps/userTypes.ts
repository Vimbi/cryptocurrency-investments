// ** Types
import { ThemeColor } from 'src/@core/layouts/types';
import { FileApiType } from './fileType';
import { NetworkType } from './networkType';

export type UsersType = {
	id?: string;
	email?: string;
	status?: string;
	avatar?: string;
	company?: string;
	country?: string;
	contact?: string;
	fullName?: string;
	username?: string;
	surname?: string;
	currentPlan?: string;
	avatarColor?: ThemeColor;

	firstName?: string;
	lastName?: string;
	description?: null | string;
	phone?: null | string;
	publicEmail?: null | string;
	youtube?: null | string;
	vkontakte?: null | string;
	telegramChannel?: null | string;
	odnoklassniki?: null | string;
	whatsapp?: null | string;
	telegram?: null | string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: null | string;
	isDeleted?: boolean;
	expertRating?: number;
	announcementCounter?: number;
	myReviewCounter?: number;
	myQuestionCounter?: number;
	publicationCounter?: number;
	rating?: number;
	photo?: null | FileApiType;
	reviewCounter?: number;
	isBanned?: null | boolean;
	restrictedUntil?: null | string;
	deletionReason?: null | string;
	roleId?: string;
	role?: RoleType;
	statusId?: string;
	region?: RegionType;
	face?: any;
	point?: any;
	isTwoFactorAuthenticationEnabled: boolean;
	parentId?: string;
	refreshToken?: string;
	referralCode?: string;
	investmentsAmount?: number;
};
export type RoleType = {
	id: string;
	name: string;
	displayName: string;
};
export type RegionType = {
	id: string;
	name: string;
	publicName: string;
};

export type WalletType = {
	id: string;
	userId?: string;
	networkId: string;
	address: string;
	note: string;
	createdAt?: string;
	network: NetworkType;
};

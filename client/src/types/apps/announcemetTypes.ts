import { ThemeColor } from 'src/@core/layouts/types';
import { ManufacturerType } from './manufacturerTypes';
import { StoresType } from './storeTypes';
import { FileApiType } from './fileType';
import { ModelType } from './modelTypes';
import { AuthorType } from './userAuthorType';

export type AnnouncementTypes = {
	id: string;
	index: number;
	authorId: string;
	storeId: string;
	categoryId: string;
	name: string;
	manufacturerId: string;
	modelId: string;
	gripWidth: number;
	horsepower: null | number;
	isNew: boolean;
	operatingTime: string;
	issueYear: null | number;
	price: number;
	isContractPrice: boolean;
	isInStock: boolean;
	availabilityDate: string;
	quantity: number;
	isWholeCountry: boolean;
	description: string;
	specifications: string[];
	rowsNumber: null | number;
	rowless: boolean;
	bunkerVolume: null | number;
	screwFeederType: null | string;
	phone: string;
	email: string;
	whatsapp: string;
	telegram: string;
	publicationStatusId: string;
	alias: string;
	viewsCounter: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: null | string;
	publishedAt: string;
	completedAt: string;
	category: {
		id: string;
		index: number;
		publicName: string;
		parentCategoryId: string;
		additionalProperties: null;
		alias: string;
	};
	manufacturer: ManufacturerType;
	store: StoresType;
	author: AuthorType;
	model: ModelType;
	announcementRegions: [
		{
			id: string;
			announcementId: string;
			regionId: string;
			region: {
				id: string;
				name: string;
				publicName: string;
				__entity: string;
			};
			__entity: string;
		}
	];
	publicationStatus: PublicationStatusType;
	photos: FileApiType[];
	bookmarks: [
		{
			id: string;
			userId: string;
			announcementId: string;
		}
	];
	avatarColor?: ThemeColor;
};

export type PublicationStatusType = {
	id: string;
	name: string;
	publicName: string;
};

export type PublicationCancelReasonsType = {
	id: string;
	name: string;
	displayName: string;
	description: string;
};

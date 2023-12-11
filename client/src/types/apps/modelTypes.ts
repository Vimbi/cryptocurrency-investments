import { ThemeColor } from 'src/@core/layouts/types';
import { ManufacturerType } from './manufacturerTypes';
import { FileApiType } from './fileType';

export type ModelType = {
	id: string;
	index: number;
	categoryId: string;
	manufacturerId: string;
	name: string;
	gripWidth: number[] | string[];
	horsepower: number[] | string[];
	description: string;
	videoLink: string;
	specifications: string;
	rowsNumber: null | number;
	rowless: null | boolean;
	bunkerVolume: null | number;
	screwFeederType: null | string;
	rating: number;
	questionCounter: number;
	reviewCounter: number;
	popularity: number;
	alias: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: null | string;
	manufacturer: ManufacturerType;
	cover: null | FileApiType;
	photos?: null | FileApiType[];
	avatarColor?: ThemeColor;
};

export type CategoryType = {
	id: string;
	index: number;
	publicName: string;
	parentCategoryId: null | string;
	additionalProperties: null | any;
	alias: string;
	cover: FileApiType;
};

import { ThemeColor } from 'src/@core/layouts/types';
import { FileApiType } from './fileType';
import { AuthorType } from './userAuthorType';

export type StoriesType = {
	id: string;
	index: number;
	comment: string;
	pros: null;
	cons: null;
	grade: null;
	likesCounter: number;
	likesSum: number;
	commentCounter: 0;
	authorId: string;
	authorCommunityId: null;
	authorCommunityName: null;
	relatedEntityId: string;
	relatedEntityName: string;
	type: string;
	deletedComment: null;
	moderatorId: null;
	publicationStatusId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: null;
	author: AuthorType;
	publicationStatus: {
		id: string;
		name: string;
		publicName: string;
		__entity: string;
	};
	photos: FileApiType[];
	likes: any[];
	avatarColor?: ThemeColor;
};

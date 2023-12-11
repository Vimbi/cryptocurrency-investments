export type ArticleType = {
	id?: string;
	title?: string;
	text?: string;
	videoLink?: string;
	files?: Array<string | { id: string; theme: string }>;
	isPublished?: boolean;
	typeId?: string;
	createdAt?: string;
	updatedAt?: null | string;
	type?: ArticleTypeType;
	articleId?: string;
	articleFiles?: {
		articleId: string;
		fileId: string;
		createdAt: string;
		file: ArticleFileType;
		theme?: string | null;
	}[];
	localeId?: string;
	theme?: string;
	localeContent: any;
};

export type ArticleTypeType = {
	id?: string;
	name: string;
	displayName?: string;
	createdAt?: string;
	localeContent?: {
		localeId: string;
		displayName: string;
		typeId: string;
		updatedAt: null | string;
		createdAt: string;
	}[];
	updatedAt?: null | string;
};
export type ArticleFileType = {
	id: string;
	path: string;
	name: string;
	extension?: string;
	key: string;
	createdAt: string;
};
export type LocaleType = {
	id: string;
	name: string;
	displayName: string;
	createdAt: string;
	updatedAt: string | null;
};

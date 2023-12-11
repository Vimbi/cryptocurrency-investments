export type ReportsType = {
	id: string;
	authorId: string;
	relatedEntityId: string;
	relatedEntityName: string;
	reportTypeId: string;
	comment: string;
	status: string;
	createdAt: string;
	updatedAt: string | null;
	author: {
		firstName: string;
		lastName: string;
	};
};
export type TypeOfReportType = {
	id: string;
	name: string;
	displayName: string;
};

export type DashoboardData = {
	announcements: number;
	comments: number;
	questions: number;
	reviews: number;
	stores: number;
	users: number;
};

export type DashboardPreview = {
	key: keyof DashoboardData;
	icon: string;
	displayName: string;
};

export type ManagerType = {
	id?: string;
	manufacturerId: string;
	userId: string;
	createdAt: string;
	user: {
		firstName: string;
		lastName: string;
	};
};
export type ManagerAddType = {
	manufacturer?: { id: string };
	store?: { id: string };
	user: { id: string };
};

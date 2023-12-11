/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (role: string) => {
	if (role) return '/apps/profile/investment';
	else return '/apps/profile/investment';
};

export default getHomeRoute;

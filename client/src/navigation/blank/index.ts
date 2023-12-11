import { NavLink } from 'src/@core/layouts/types';

const Navigation = (): NavLink[] => {
	return [
		{
			title: 'Products',
			path: '/products'
		},
		{
			title: 'Academy',
			path: '/article/academy'
		},
		{
			title: 'News',
			path: '/article/news'
		},

		{
			title: 'Contacts',
			path: '/contacts'
		},
		{
			title: 'OpenOffice',
			path: '/open-an-office'
		}
	];
};

export const SubNavigation = (): NavLink[] => {
	return [
		{
			title: 'ReferralProgram',
			path: '/referral-levels'
		},
		{
			title: 'Support',
			path: '/faq#support'
		},
		{
			title: 'FAQ',
			path: '/faq'
		},
		{
			title: 'Raffles',
			path: '/surprise'
		}
	];
};

export default Navigation;

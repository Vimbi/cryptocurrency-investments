import { HorizontalNavItemsType } from 'src/@core/layouts/types';

const BlankVerticalNavigation = (): HorizontalNavItemsType => {
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
		},
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

export default BlankVerticalNavigation;

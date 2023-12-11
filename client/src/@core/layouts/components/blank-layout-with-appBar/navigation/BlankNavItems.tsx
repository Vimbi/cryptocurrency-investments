// ** Types
import { NavLink, HorizontalNavItemsType } from 'src/@core/layouts/types';

// ** Custom Navigation Components
import BlankNavLink from './BlankNavLink';

interface Props {
	hasParent?: boolean;
	navItems?: HorizontalNavItemsType;
}
const resolveComponent = () => {
	return BlankNavLink;
};

const BlankNavItems = (props: Props) => {
	const RenderMenuItems = props.navItems?.map((item: NavLink, index: number) => {
		const TagName: any = resolveComponent();

		return <TagName {...props} key={index} item={item} />;
	});

	return <>{RenderMenuItems}</>;
};

export default BlankNavItems;

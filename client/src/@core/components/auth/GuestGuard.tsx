// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth';
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute';

interface GuestGuardProps {
	children: ReactNode;
	fallback: ReactElement | null;
}

const GuestGuard = (props: GuestGuardProps) => {
	const { children } = props;
	const auth = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!router.isReady) {
			return;
		}

		if (
			window.localStorage.getItem('userData') &&
			(router.route.includes('login') ||
				router.route.includes('register') ||
				router.route.includes('forgot-password'))
		) {
			router.replace(getHomeRoute(auth.user?.role?.displayName || '/'));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.route]);

	if (auth.loading || (!auth.loading && auth.user !== null)) {
		// return fallback;
		return <>{children}</>;
	}

	return <>{children}</>;
};

export default GuestGuard;

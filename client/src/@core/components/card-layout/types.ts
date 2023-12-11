import { ReactNode } from 'react';

export type CardLayoutProps = {
	isLoaded: boolean;
	data: Record<string, any> | null;
	children: ReactNode;
	handleOnRedirect?: () => void;
};

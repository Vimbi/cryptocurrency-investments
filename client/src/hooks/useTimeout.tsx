import { useEffect, useRef } from 'react';

const useTimeout = (ms = 500) => {
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => {
		return () => {
			clearTimeout(timeoutRef.current);
		};
	}, []);

	return (fnc: (...args: any[]) => void) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(fnc, ms);
	};
};

export default useTimeout;

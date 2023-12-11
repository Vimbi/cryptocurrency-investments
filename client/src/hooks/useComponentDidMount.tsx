import { useEffect, useRef } from 'react';

const useComponentDidMount = () => {
	const mounted = useRef<boolean>(false);
	useEffect(() => {
		mounted.current = true;
	}, []);

	return mounted.current;
};

export default useComponentDidMount;

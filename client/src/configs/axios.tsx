import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

const AxiosInterceptor = ({ children }: { children?: ReactNode }) => {
	const router = useRouter();
	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			function (response) {
				return response;
			},
			async function (error) {
				if (isAxiosError(error) && error.response?.status === 401) {
					router.push('/401');
				}

				return Promise.reject(error);
			}
		);

		return () => axios.interceptors.response.eject(interceptor);
	}, []);

	return <>{children}</>;
};

export default AxiosInterceptor;

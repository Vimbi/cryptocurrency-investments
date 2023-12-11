// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
import { isAxiosError } from 'axios';
import axios from 'axios';

// ** Config
import authConfig from 'src/configs/auth';

// ** Types
import {
	AuthValuesType,
	LoginParams,
	ErrCallbackType,
	RegisterParams,
	ErrRegisterCallbackType,
	ConfrimPhonePararms,
	ConfirmCallbackType,
	LoginResponse,
	SuccessSendCodeCallbackType,
	loginByTwoFactorResponse
} from './types';
import { UsersType } from 'src/types/apps/userTypes';

import getHomeRoute from 'src/layouts/components/acl/getHomeRoute';

// ** Defaults
const defaultProvider: AuthValuesType = {
	user: null,
	loading: false,
	setUser: () => null,
	setLoading: () => Boolean,
	login: () => Promise.resolve(),
	logout: () => Promise.resolve(),
	register: () => Promise.resolve(),
	confirmPhone: () => Promise.resolve(),
	loginByTwoFactor: () => Promise.resolve(),
	resetConfirmPhone: () => Promise.resolve(),
	sendCode: () => Promise.resolve()
};

const AuthContext = createContext(defaultProvider);

type Props = {
	children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
	// ** States
	const [user, setUser] = useState<UsersType | null>(defaultProvider.user);
	const [loading, setLoading] = useState<boolean>(defaultProvider.loading);

	// ** Hooks
	const router = useRouter();

	useEffect(() => {
		const initAuth = async (): Promise<void> => {
			const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
			if (storedToken) {
				setLoading(true);
				await axios
					.get(authConfig.meEndpoint, {
						headers: {
							Authorization: `Bearer ${storedToken}`
						}
					})
					.then(async response => {
						setLoading(false);
						if (response.data) {
							setUser({ ...response.data });
						}
					})
					.catch(e => {
						if (
							(authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) ||
							(isAxiosError(e) && e.response?.status === 401)
						) {
							localStorage.removeItem('userData');
							localStorage.removeItem(authConfig.onTokenExpiration);
							localStorage.removeItem(authConfig.storageTokenKeyName);
							setUser(null);
							setLoading(false);
							router.replace('/login');
						}
					});
			} else {
				setLoading(false);
			}
		};

		initAuth();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleLoginByPassword = (
		params: LoginParams,
		errorCallback?: ErrCallbackType,
		twoFactorCallback?: (code?: string) => void
	) => {
		axios
			.post<LoginResponse>(authConfig.loginByPasswordEndpoint, {
				email: params.email,
				password: params.password,
				recaptchaToken: params.recaptchaToken
			})
			.then(async response => {
				if (response.data.user) {
					// params.rememberMe
					// 	? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token)
					// 	: null;
					window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token);
					const returnUrl = router.query.returnUrl;

					setUser({ ...response.data.user });

					// params.rememberMe
					// 	? window.localStorage.setItem('userData', JSON.stringify(response.data.user))
					// 	: null;
					window.localStorage.setItem('userData', JSON.stringify(response.data.user));
					const redirectURL =
						returnUrl && returnUrl !== '/'
							? returnUrl
							: getHomeRoute(response.data.user.role!.name as string);

					router.replace(redirectURL as string);
				} else {
					window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token);
					if (twoFactorCallback) twoFactorCallback(response.data.code);
				}
			})

			.catch(err => {
				if (errorCallback) errorCallback(err);
			});
	};

	const handleLogout = () => {
		setUser(null);
		window.localStorage.removeItem('userData');
		window.localStorage.removeItem(authConfig.storageTokenKeyName);
		router.push('/login');
	};

	const handleRegistration = (params: RegisterParams, errorCallback?: ErrRegisterCallbackType) => {
		axios
			.post<{ code?: string; userId?: string }>(authConfig.registerEndpoint, params)
			.then(async response => {
				// setUser({ ...response.data.user });
				// window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.token);
				// window.localStorage.setItem('userData', JSON.stringify(response.data.user));
				const pathname = router.pathname;
				if (response.data?.code) {
					router.push({
						pathname,
						query: {
							userId: response.data.userId,
							email: params.email.split(' ').join(''),
							code: response.data.code
						}
					});
				} else if (response.data?.userId) {
					router.push({
						pathname,
						query: {
							userId: response.data.userId,
							email: params.email.split(' ').join('')
						}
					});
				} else if (response.status === 201) {
					router.push('/register/success?email=' + params.email.split(' ').join(''));
				}
			})
			.catch(err => {
				if (errorCallback) {
					if (axios.isAxiosError(err)) {
						errorCallback(err);
					}
				}
			});
	};

	const handleConfirmPhone = (params: ConfrimPhonePararms, callback?: ConfirmCallbackType) => {
		axios
			.post<{ result: boolean }>(authConfig.confirmPhoneEndpoint, params)
			.then(async response => {
				if (callback) callback(response.data.result);
			})
			.catch(err => {
				if (axios.isAxiosError(err)) {
					if (callback) callback(false);
				}
			});
	};

	const handleResetConfirmPhone = (params: { email: string }) => {
		axios
			.post<{ userId: string; code?: string }>(authConfig.resentConfirmPhoneEndpoint, params)
			.then(async response => {
				const pathname = router.pathname;
				if (response.data?.code) {
					router.push({
						pathname,
						query: {
							userId: response.data.userId,
							email: params.email,
							code: response.data.code
						}
					});
				} else {
					router.push({
						pathname,
						query: {
							userId: response.data.userId,
							email: params.email
						}
					});
				}
			})
			.catch(err => {
				if (axios.isAxiosError(err)) {
					console.log('LL: handleConfirmPhone -> err', err);
				}
			});
	};

	const hadleOnSendCode = (
		successCallback?: SuccessSendCodeCallbackType,
		errorCallback?: (message: string) => void
	) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

		axios
			.get<{ code: string; userId: string; result?: false; message?: string }>(authConfig.sendCodeEndpoint, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			})
			.then(res => {
				if (typeof res.data.result === 'boolean' && !res.data.result) {
					return Promise.reject({ message: res.data.message });
				} else {
					if (successCallback) {
						successCallback(res.data);
					}
				}
			})
			.catch(error => {
				if (errorCallback) {
					errorCallback(error?.message || 'Ошибка');
				}
			});
	};

	const handleLoginByTwoFactor = (params: { twoFactorAuthenticationCode: string }, errorCallback?: () => void) => {
		const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);

		axios
			.post<loginByTwoFactorResponse>(authConfig.loginByTwoFactorEndpoint, params, {
				headers: {
					Authorization: `Bearer ${storedToken}`
				}
			})
			.then(res => {
				window.localStorage.setItem(authConfig.storageTokenKeyName, res.data.token);

				const returnUrl = router.query.returnUrl;

				setUser({ ...res.data.user });

				window.localStorage.setItem('userData', JSON.stringify(res.data.user));

				const redirectURL =
					returnUrl && returnUrl !== '/' ? returnUrl : getHomeRoute(res.data.user.role!.name as string);

				router.replace(redirectURL as string);
			})
			.catch(() => {
				if (errorCallback) {
					errorCallback();
				}
			});
	};

	const values = {
		user,
		loading,
		setUser,
		setLoading,
		login: handleLoginByPassword,
		logout: handleLogout,
		register: handleRegistration,
		confirmPhone: handleConfirmPhone,
		resetConfirmPhone: handleResetConfirmPhone,
		loginByTwoFactor: handleLoginByTwoFactor,
		sendCode: hadleOnSendCode
	};

	return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };

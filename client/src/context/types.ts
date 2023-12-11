import { UsersType } from 'src/types/apps/userTypes';
import { AxiosError } from 'axios';

export type ErrCallbackType = (err: { message: string[] }) => void;

export type ErrRegisterCallbackType = (err: AxiosError<{ message: string[] | string }>) => void;

export type ConfirmCallbackType = (value: boolean) => void;

export type SuccessSendCodeCallbackType = (data: { code: string; userId: string }) => void;

export type LoginParams = {
	email: string;
	password: string;
	rememberMe?: boolean;
	recaptchaToken: string;
};

export type LoginResponse = {
	user?: UsersType;
	token: string;
	refreshToken?: string;
	code?: string;
};

export type loginByTwoFactorResponse = {
	user: UsersType;
	token: string;
	refreshToken?: string;
};

export type RegisterParams = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	surname: string;
	referralCode: string;
};

export type ConfrimPhonePararms = {
	userId: string;
	code: string;
};

export type RegisterErrors = [
	'email: without message',
	'password: without message',
	'firstName: without message',
	'lastName: without message',
	'surname: without message',
	'referralCode: without message'
];

export type RegisterSuccess = '';

export type AuthValuesType = {
	loading: boolean;
	logout: () => void;
	user: UsersType | null;
	setLoading: (value: boolean) => void;
	setUser: (value: UsersType | null) => void;
	login: (params: LoginParams, errorCallback?: ErrCallbackType, twoFactorCallback?: () => void) => void;
	register: (params: RegisterParams, errorCallback?: ErrRegisterCallbackType) => void;
	confirmPhone: (params: ConfrimPhonePararms, callback?: ConfirmCallbackType) => void;
	resetConfirmPhone: (params: { email: string }) => void;
	loginByTwoFactor: (params: { twoFactorAuthenticationCode: string }, errorCallback?: () => void) => void;
	sendCode: (successCallback?: SuccessSendCodeCallbackType, errorCallback?: (message: string) => void) => void;
};

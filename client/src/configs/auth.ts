const configFactory = () => {
	const baseUrl =
		process.env.NEXT_PUBLIC_NODE_ENV === 'production'
			? 'https://nephritetrade.com'
			: 'https://80-78-248-81.cloudvps.regruhosting.ru';
	const siteKey =
		process.env.NEXT_PUBLIC_NODE_ENV === 'production'
			? '6Ld2_a4oAAAAAGJ-wIjpm3nUBE86-uMW849CzU7m'
			: '6Ldcd7IoAAAAAJoujDlsOo2n_u2psoHfgkBexOss';

	// process.env.NODE_ENV === 'production'
	// 	? 'https://nephritetrade.com'
	// 	: 'https://80-78-248-81.cloudvps.regruhosting.ru';

	const baseApiUrl = baseUrl + '/api';

	return {
		baseDomainUrl: baseUrl,
		baseApiUrl: baseApiUrl,
		meEndpoint: baseApiUrl + '/auth/me',
		loginByPasswordEndpoint: baseApiUrl + '/auth/login/password',
		loginByTwoFactorEndpoint: baseApiUrl + '/auth/2fa/authenticate',
		registerEndpoint: baseApiUrl + '/auth/register',
		confirmPhoneEndpoint: baseApiUrl + '/auth/phone/confirm',
		resentConfirmPhoneEndpoint: baseApiUrl + '/auth/resend-confirm-phone',
		sendCodeEndpoint: baseApiUrl + '/auth/send-code',
		storageTokenKeyName: 'accessToken',
		onTokenExpiration: 'refreshToken',
		siteKey: Boolean(process.env.NEXT_PUBLIC_SITE_KEY) ? (process.env.NEXT_PUBLIC_SITE_KEY as string) : siteKey
	};
};

export default configFactory();

//https://nephritetrade.com
//https://80-78-248-81.cloudvps.regruhosting.ru

// const authConfig = {
// 	baseDomainUrl: config.baseDomainUrl,
// 	baseApiUrl: config.baseApiUrl,
// 	meEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/me',
// 	loginByPasswordEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/login/password',
// 	loginByTwoFactorEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/2fa/authenticate',
// 	registerEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/register',
// 	confirmPhoneEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/phone/confirm',
// 	resentConfirmPhoneEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/resend-confirm-phone',
// 	sendCodeEndpoint: 'https://80-78-248-81.cloudvps.regruhosting.ru/api/auth/send-code',
// 	storageTokenKeyName: 'accessToken',
// 	onTokenExpiration: 'refreshToken' // logout | refreshToken
// };

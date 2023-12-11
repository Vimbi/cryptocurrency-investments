const path = require('path');

/** @type {import('next-i18next').UserConfig} */

module.exports = {
	i18n: {
		locales: ['en', 'ru'],
		defaultLocale: 'ru'
	},
	// debug: process.env.NODE_ENV === 'development',
	reloadOnPrerender: process.env.NODE_ENV === 'development',
	localePath: path.resolve('./public/locales'),
	saveMissing: false,
	strictMode: false,
	serializeConfig: false,
	react: { useSuspense: false },
	localeDetection: true
};
